import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, c as useConvex, l as useMutation, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { n as __reExport, r as motion_exports, t as __exportAll } from "./motion-DtlbbvFg.mjs";
import { F as getPreviewGoogleWorkspaceStatus, I as getPreviewMeetingWorkspaceMembers, L as getPreviewMeetings } from "./preview-data-CXkRNfsX.mjs";
import { C as instantiateDateTimeFormat, c as cn, g as getWorkspaceId } from "./utils-hh4sibN0.mjs";
import { _ as format } from "../_libs/date-fns.mjs";
import { b as pressableScaleClass, d as fadeInUpVariants, f as fadeVariants, h as listItemEnterClass, w as subtlePulseVariants } from "./motion-Cf6ujF0h.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CDBnK3ba.mjs";
import { t as Skeleton } from "./skeleton-CQ4LJS0E.mjs";
import { s as logError } from "./convex-errors-sHK0JmZ7.mjs";
import { a as notifyInfo, c as reportConvexFailure, i as notifyFailure, o as notifySuccess } from "./notifications-DQZKskhM.mjs";
import { i as useSearchParams, n as usePathname, r as useRouter$1 } from "./navigation-C1M-rNAu.mjs";
import { d as apiFetch, g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { A as meetingsApi, D as filesApi, O as meetingArchivesApi, Y as usersApi, k as meetingIntegrationsApi } from "./convex-api-msEHRhRb.mjs";
import { n as useClientContext } from "./client-context-BNynWehF.mjs";
import { $n as Clock3, Dr as CalendarPlus, F as Sparkles, H as ShieldAlert, It as Mic, J as Send, Kn as Copy, Or as CalendarDays, Pt as Minimize2, Ur as ArrowLeft, V as ShieldCheck, Vn as Download, Wt as Maximize2, Xn as CloudDownload, Yt as LoaderCircle, b as TriangleAlert, i as X, l as Video, mt as PictureInPicture2, ot as Radio, tn as Link2, u as Users, un as Info, xn as Globe, xt as Paperclip, zt as MessageSquareText } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cuo0TTXb.mjs";
import { i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-C8tBdgAy.mjs";
import { t as Input } from "./input-DuOB9ezo.mjs";
import { t as FadeIn } from "./animate-in-JYv0iBIt.mjs";
import { a as TabsTrigger, i as TabsList, n as Tabs, r as TabsContent } from "./tabs-BP_mm-cH.mjs";
import { t as SvglBrandLogo } from "./svgl-brand-logo-rIFZzPiw.mjs";
import { i as getButtonClasses, n as PAGE_TITLES, t as DASHBOARD_THEME } from "./dashboard-theme-DM5oBGdY.mjs";
import { r as useConvexQueryError, t as mergeQueryErrors } from "./use-convex-query-error-P2IX7lhG.mjs";
import { t as Textarea } from "./textarea-C0M2IvQZ.mjs";
import { n as AlertDescription, r as AlertTitle, t as Alert } from "./alert-DYeH1Q3p.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-Be-Tzxcj.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-DghqGd0Q.mjs";
import { t as ScrollArea } from "./scroll-area-DnXuhDTw.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as PageSkeletonBoundary } from "./page-skeleton-boundary-ZBP950Us.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-BwHc7N7y.mjs";
import { t as Calendar$1 } from "./calendar-9B6zD0Is.mjs";
import { t as PageMotionShell } from "./page-motion-shell-Ci2leIYf.mjs";
import { t as QueryErrorAlert } from "./query-error-alert-BQQBffRH.mjs";
import { t as DashboardPageHero } from "./dashboard-page-hero-BIWBoJtP.mjs";
import { a as SheetHeader, i as SheetDescription, o as SheetTitle, r as SheetContent, t as Sheet } from "./sheet-Ybc8ZbjG.mjs";
import { n as uploadStorageFileWithPublicUrl } from "./upload-storage-file-CUAnugSD.mjs";
import { n as ChatMediaGallery, s as useVoiceInput } from "./use-voice-input-CLPTluum.mjs";
import { n as AgentMentionText } from "./mention-highlights-C5eBIzIc.mjs";
import { t as Markdown } from "../_libs/react-markdown+[...].mjs";
import { a as mergeMeetingParticipantEmails, c as parseAttendeeInput, d as sanitizeMeetingParticipantEmails, f as stripMarkdownFence, n as buildMeetingAttendeeDraft, o as normalizeEmail, r as buildMeetingAttendeeSuggestions, s as normalizeNotesSummary } from "./attendees-DnubeZTD.mjs";
import { t as EmptyState } from "./empty-state-sOehX0F0.mjs";
import { r as validateAttachments } from "./utils-Dp3pETO6.mjs";
import { c as rn, d as ca, f as Track, l as rr, s as Xt, t as dist_exports } from "../_libs/@livekit/components-react+[...].mjs";
import { t as require_jspdf_node_min } from "../_libs/jspdf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/meetings-BYxQKzUA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_jspdf_node_min = require_jspdf_node_min();
function useAttendeeController(options) {
	const [input, setInput] = (0, import_react.useState)("");
	const [emails, setEmailsState] = (0, import_react.useState)([]);
	const suggestions = buildMeetingAttendeeSuggestions({
		...options,
		queryValue: input,
		selectedEmails: emails
	});
	const setEmails = (nextEmails) => {
		setEmailsState(sanitizeMeetingParticipantEmails(nextEmails, options.organizerEmail));
	};
	const addEmails = (entries) => {
		const organizer = options.organizerEmail ? normalizeEmail(options.organizerEmail) : null;
		const includesOrganizer = organizer ? entries.some((entry) => normalizeEmail(entry) === organizer) : false;
		const participantEntries = sanitizeMeetingParticipantEmails(entries, options.organizerEmail);
		if (includesOrganizer && participantEntries.length === 0) {
			notifyFailure({
				title: "Add another participant",
				message: "Your own profile is already the meeting organizer. Add at least one other participant."
			});
			return;
		}
		if (participantEntries.length === 0) return;
		setEmailsState((current) => mergeMeetingParticipantEmails(current, participantEntries, options.organizerEmail));
	};
	const commitInput = () => {
		const parsed = parseAttendeeInput(input);
		if (parsed.length === 0 && input.trim().length > 0) {
			notifyFailure({
				title: "Invalid attendee email",
				message: "Enter a valid email or choose a teammate from suggestions."
			});
			return false;
		}
		addEmails(parsed);
		setInput("");
		return true;
	};
	const addSuggestedEmail = (email) => {
		addEmails([email]);
		setInput("");
	};
	const removeEmail = (email) => {
		const normalized = normalizeEmail(email);
		setEmailsState((current) => current.filter((value) => normalizeEmail(value) !== normalized));
	};
	const handleKeyDown = (event) => {
		if (event.key === "Enter" || event.key === "Tab") {
			const firstSuggestion = suggestions[0];
			if (firstSuggestion && input.trim().length > 0) {
				event.preventDefault();
				addSuggestedEmail(firstSuggestion.email);
				return;
			}
			event.preventDefault();
			commitInput();
			return;
		}
		if (event.key === "," || event.key === ";") {
			event.preventDefault();
			commitInput();
		}
	};
	const resolveSubmission = () => buildMeetingAttendeeDraft({
		selectedEmails: emails,
		pendingInput: input,
		organizerEmail: options.organizerEmail
	});
	const reset = () => {
		setInput("");
		setEmailsState([]);
	};
	return {
		input,
		setInput,
		emails,
		setEmails,
		suggestions,
		commitInput,
		addSuggestedEmail,
		removeEmail,
		handleKeyDown,
		resolveSubmission,
		reset
	};
}
function useMeetingAttendees(options) {
	return {
		schedule: useAttendeeController(options),
		quick: useAttendeeController(options)
	};
}
function pluralize(count, singular, plural = `${singular}s`) {
	return `${count} ${count === 1 ? singular : plural}`;
}
function describeNotificationSummary(summary, builder) {
	if (!summary || summary.attempted === 0) return builder.none;
	if (summary.failed === 0) return builder.allSent(summary.sent, summary.skipped);
	if (summary.sent === 0) return builder.failed(summary.failed, summary.skipped);
	return builder.partial(summary.sent, summary.failed, summary.skipped);
}
var LOCAL_DATE_TIME_FORMATTERS = /* @__PURE__ */ new Map();
function getLocalDateTimeFormatter(timezone) {
	const normalizedTimeZone = typeof timezone === "string" && timezone.trim().length > 0 ? timezone : "";
	const existingFormatter = LOCAL_DATE_TIME_FORMATTERS.get(normalizedTimeZone);
	if (existingFormatter) return existingFormatter;
	const formatter = instantiateDateTimeFormat("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: normalizedTimeZone || void 0
	});
	LOCAL_DATE_TIME_FORMATTERS.set(normalizedTimeZone, formatter);
	return formatter;
}
function extractRoomNameFromMeetingLink(value) {
	if (typeof value !== "string") return null;
	const normalized = value.trim();
	if (normalized.length === 0) return null;
	try {
		const room = new URL(normalized).searchParams.get("room");
		if (typeof room === "string" && room.trim().length > 0) return room.trim();
	} catch {}
	return null;
}
function formatMeetingTitleFromRoomName(value) {
	if (typeof value !== "string") return null;
	const normalized = value.trim().toLowerCase();
	if (normalized.length === 0) return null;
	const segments = normalized.split("-").filter(Boolean);
	if (segments.length === 0) return null;
	const withoutPrefix = segments[0] === "cohorts" ? segments.slice(1) : segments;
	const trimmedSegments = withoutPrefix.length > 2 ? withoutPrefix.slice(0, -2) : withoutPrefix;
	const displaySegments = trimmedSegments.length > 0 ? trimmedSegments : withoutPrefix;
	if (displaySegments.length === 0) return null;
	return displaySegments.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1)).join(" ");
}
function sanitizeRoomNameSegment(value) {
	if (typeof value !== "string") return "meeting";
	const normalized = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24);
	return normalized.length > 0 ? normalized : "meeting";
}
function buildFallbackRoomName(options) {
	return `cohorts-${sanitizeRoomNameSegment(options.title)}-${coerceValidDate(options.startTimeMs)?.getTime().toString(36) ?? "start"}-${coerceValidDate(options.endTimeMs)?.getTime().toString(36) ?? "end"}`;
}
function coerceValidDate(timestamp) {
	if (timestamp == null) return null;
	const date = new Date(timestamp);
	return Number.isNaN(date.getTime()) ? null : date;
}
function formatLocalDateTime(timestamp, timezone) {
	const date = coerceValidDate(timestamp);
	if (!date) return "Unknown time";
	try {
		return getLocalDateTimeFormatter(timezone).format(date);
	} catch {
		try {
			return date.toISOString();
		} catch {
			return "Unknown time";
		}
	}
}
function toTimeValue(timestamp) {
	const date = coerceValidDate(timestamp);
	if (!date) return "09:00";
	return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}
function normalizeMeetingProcessingState(value) {
	return value === "processing" || value === "failed" ? value : "idle";
}
function isMeetingPostProcessing(meeting) {
	return normalizeMeetingProcessingState(meeting.transcriptProcessingState) !== "idle" || normalizeMeetingProcessingState(meeting.notesProcessingState) !== "idle";
}
function statusVariant(status) {
	switch (status) {
		case "completed": return "secondary";
		case "cancelled": return "destructive";
		case "in_progress": return "default";
		default: return "outline";
	}
}
var MEETING_ACTION_TIMEOUT_MS = 2e4;
function useMeetingsPageController() {
	const { user, startGoogleWorkspaceOauth } = useAuth();
	const { selectedClientId } = useClientContext();
	const { isPreviewMode } = usePreview();
	const { replace } = useRouter$1();
	const pathname = usePathname();
	const urlSearchParams = useSearchParams();
	const workspaceId = getWorkspaceId(user);
	const canSchedule = user?.role === "admin" || user?.role === "team";
	const [title, setTitle] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [meetingDate, setMeetingDate] = (0, import_react.useState)(void 0);
	const [meetingTime, setMeetingTime] = (0, import_react.useState)("09:00");
	const [durationMinutes, setDurationMinutes] = (0, import_react.useState)("30");
	const [timezone, setTimezone] = (0, import_react.useState)(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
	const [scheduling, setScheduling] = (0, import_react.useState)(false);
	const [quickStarting, setQuickStarting] = (0, import_react.useState)(false);
	const [editingMeetingId, setEditingMeetingId] = (0, import_react.useState)(null);
	const [cancellingMeetingId, setCancellingMeetingId] = (0, import_react.useState)(null);
	const [cancelDialogMeeting, setCancelDialogMeeting] = (0, import_react.useState)(null);
	const [activeInSiteMeeting, setActiveInSiteMeeting] = (0, import_react.useState)(null);
	const [meetingOverrides, setMeetingOverrides] = (0, import_react.useState)({});
	const [quickMeetDialogOpen, setQuickMeetDialogOpen] = (0, import_react.useState)(false);
	const [quickMeetTitle, setQuickMeetTitle] = (0, import_react.useState)("Instant Cohorts Room");
	const [quickMeetDescription, setQuickMeetDescription] = (0, import_react.useState)("Native Cohorts meeting launched from the dashboard");
	const [quickMeetDurationMinutes, setQuickMeetDurationMinutes] = (0, import_react.useState)("30");
	const [sharedRoomName, setSharedRoomName] = (0, import_react.useState)(null);
	const oauthHandledRef = (0, import_react.useRef)(false);
	const meetings = useQuery(meetingsApi.list, workspaceId && !isPreviewMode ? {
		workspaceId,
		clientId: selectedClientId ?? null,
		includePast: false,
		limit: 30
	} : "skip");
	const googleWorkspaceStatus = useQuery(meetingIntegrationsApi.getGoogleWorkspaceStatus, workspaceId && !isPreviewMode ? { workspaceId } : "skip");
	const googleWorkspaceStatusLoading = Boolean(workspaceId) && !isPreviewMode && googleWorkspaceStatus === void 0;
	const upcomingMeetingsLoading = Boolean(workspaceId) && !isPreviewMode && meetings === void 0;
	const workspaceMembers = useQuery(usersApi.listWorkspaceMembers, workspaceId && !isPreviewMode ? {
		workspaceId,
		limit: 200
	} : "skip");
	const platformUsers = useQuery(usersApi.listAllUsers, workspaceId && !isPreviewMode ? { limit: 500 } : "skip");
	const disconnectGoogleWorkspace = useMutation(meetingIntegrationsApi.deleteGoogleWorkspaceIntegration);
	const updateMeetingStatus = useMutation(meetingsApi.updateStatus);
	const sharedRoomMeeting = useQuery(meetingsApi.getByRoomName, workspaceId && sharedRoomName && !isPreviewMode ? {
		workspaceId,
		roomName: sharedRoomName
	} : "skip");
	const meetingsQueryError = mergeQueryErrors(useConvexQueryError({
		data: meetings,
		skipped: isPreviewMode || !workspaceId,
		fallbackMessage: "Unable to load meetings."
	}), useConvexQueryError({
		data: googleWorkspaceStatus,
		skipped: isPreviewMode || !workspaceId,
		fallbackMessage: "Unable to load Google Workspace status."
	}), useConvexQueryError({
		data: workspaceMembers,
		skipped: isPreviewMode || !workspaceId,
		fallbackMessage: "Unable to load workspace members."
	}), useConvexQueryError({
		data: platformUsers,
		skipped: isPreviewMode || !workspaceId,
		fallbackMessage: "Unable to load users."
	}));
	const previewTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
	const previewMeetings = getPreviewMeetings(selectedClientId ?? null, previewTimezone);
	const resolvedGoogleWorkspaceStatus = isPreviewMode ? getPreviewGoogleWorkspaceStatus() : googleWorkspaceStatus;
	const meetingAttendees = useMeetingAttendees({
		workspaceMembers: isPreviewMode ? getPreviewMeetingWorkspaceMembers() : workspaceMembers ?? [],
		platformUsers: isPreviewMode ? getPreviewMeetingWorkspaceMembers() : platformUsers ?? [],
		organizerId: user?.id ?? null,
		organizerEmail: user?.email ?? null
	});
	const scheduleAttendees = meetingAttendees.schedule;
	const quickAttendees = meetingAttendees.quick;
	(0, import_react.useEffect)(() => {
		if (oauthHandledRef.current) return;
		const oauthSuccess = urlSearchParams.get("oauth_success") === "true";
		const oauthError = urlSearchParams.get("oauth_error");
		const provider = urlSearchParams.get("provider");
		const message = urlSearchParams.get("message");
		const roomParam = urlSearchParams.get("room");
		setSharedRoomName(roomParam && roomParam.trim().length > 0 ? roomParam.trim() : null);
		if (!oauthSuccess && !oauthError) {
			oauthHandledRef.current = true;
			return;
		}
		if (provider === "google-workspace") if (oauthSuccess) notifySuccess({
			title: "Google Workspace connected",
			message: "You can now schedule calendar-backed Cohorts meeting rooms from this tab."
		});
		else notifyFailure({
			title: "Google Workspace connection failed",
			message: message || "Please retry the OAuth flow."
		});
		const cleanedParams = new URLSearchParams(urlSearchParams.toString());
		cleanedParams.delete("oauth_success");
		cleanedParams.delete("oauth_error");
		cleanedParams.delete("provider");
		cleanedParams.delete("message");
		const nextQuery = cleanedParams.toString();
		replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
		oauthHandledRef.current = true;
	}, [
		pathname,
		replace,
		urlSearchParams
	]);
	const upcomingMeetings = (() => {
		const mergedMeetings = (isPreviewMode ? previewMeetings : meetings ?? []).map((meeting) => meetingOverrides[meeting.legacyId] ?? meeting);
		const knownMeetingIds = new Set(mergedMeetings.map((meeting) => meeting.legacyId));
		for (const override of Object.values(meetingOverrides)) if (!knownMeetingIds.has(override.legacyId) && isMeetingPostProcessing(override)) mergedMeetings.unshift(override);
		return mergedMeetings;
	})();
	const editingMeeting = upcomingMeetings.find((meeting) => meeting.legacyId === editingMeetingId) ?? null;
	const scheduleRequiresGoogleWorkspace = editingMeeting ? Boolean(editingMeeting.calendarEventId) : true;
	const scheduleDisabled = isPreviewMode || !canSchedule || scheduling || googleWorkspaceStatusLoading || scheduleRequiresGoogleWorkspace && !resolvedGoogleWorkspaceStatus?.connected;
	const scheduleAttendeeDraft = scheduleAttendees.resolveSubmission();
	const quickAttendeeDraft = quickAttendees.resolveSubmission();
	const resetQuickMeetForm = () => {
		setQuickMeetTitle("Instant Cohorts Room");
		setQuickMeetDescription("Native Cohorts meeting launched from the dashboard");
		setQuickMeetDurationMinutes("30");
		quickAttendees.reset();
	};
	const setRoomUrlState = (roomName) => {
		const cleanedParams = new URLSearchParams(urlSearchParams.toString());
		if (roomName) cleanedParams.set("room", roomName);
		else cleanedParams.delete("room");
		const nextQuery = cleanedParams.toString();
		replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
		setSharedRoomName(roomName);
	};
	const handleConnectGoogleWorkspace = async () => {
		if (isPreviewMode) {
			notifyInfo({
				title: "Preview mode",
				message: "Google Workspace actions are disabled while sample meeting data is active."
			});
			return;
		}
		if (!canSchedule) {
			notifyFailure({
				title: "Read-only access",
				message: "Client users cannot connect Google Workspace integrations."
			});
			return;
		}
		if (typeof window === "undefined") return;
		const redirect = `${window.location.pathname}${window.location.search}`;
		try {
			const { url } = await startGoogleWorkspaceOauth(redirect);
			window.location.href = url;
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useMeetingsPageController:connectGoogleWorkspace",
				title: "Unable to connect Google Workspace",
				fallbackMessage: "Unable to connect Google Workspace."
			});
		}
	};
	const handleDisconnectGoogleWorkspace = async () => {
		if (isPreviewMode) {
			notifyInfo({
				title: "Preview mode",
				message: "Google Workspace actions are disabled while sample meeting data is active."
			});
			return;
		}
		if (!canSchedule) {
			notifyFailure({
				title: "Read-only access",
				message: "Client users cannot disconnect Google Workspace integrations."
			});
			return;
		}
		if (!workspaceId) return;
		try {
			await disconnectGoogleWorkspace({ workspaceId });
			notifySuccess({
				title: "Google Workspace disconnected",
				message: "Meeting scheduling is disabled until you reconnect."
			});
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useMeetingsPageController:disconnectGoogleWorkspace",
				title: "Disconnect failed",
				fallbackMessage: "Unable to disconnect Google Workspace."
			});
		}
	};
	const resetScheduleForm = () => {
		setTitle("");
		setDescription("");
		scheduleAttendees.reset();
		setDurationMinutes("30");
		setEditingMeetingId(null);
	};
	const handleMeetingUpdated = (updatedMeeting) => {
		setMeetingOverrides((current) => ({
			...current,
			[updatedMeeting.legacyId]: updatedMeeting
		}));
		setActiveInSiteMeeting((current) => current?.legacyId === updatedMeeting.legacyId ? updatedMeeting : current);
		setRoomUrlState(updatedMeeting.roomName ?? extractRoomNameFromMeetingLink(updatedMeeting.meetLink));
	};
	const resolveMeetingRecord = (meeting) => {
		if (!meeting) return null;
		const pool = sharedRoomMeeting ? [sharedRoomMeeting, ...upcomingMeetings] : upcomingMeetings;
		const legacyId = typeof meeting.legacyId === "string" && meeting.legacyId.trim().length > 0 ? meeting.legacyId : null;
		if (legacyId) return pool.find((candidate) => candidate.legacyId === legacyId) ?? meeting;
		const calendarEventId = typeof meeting.calendarEventId === "string" && meeting.calendarEventId.trim().length > 0 ? meeting.calendarEventId : null;
		if (calendarEventId) return pool.find((candidate) => candidate.calendarEventId === calendarEventId) ?? meeting;
		const roomName = (typeof meeting.roomName === "string" && meeting.roomName.trim().length > 0 ? meeting.roomName : null) ?? extractRoomNameFromMeetingLink(meeting.meetLink);
		if (roomName) return pool.find((candidate) => candidate.roomName === roomName) ?? meeting;
		const meetLink = typeof meeting.meetLink === "string" && meeting.meetLink.trim().length > 0 ? meeting.meetLink : null;
		if (meetLink) return pool.find((candidate) => candidate.meetLink === meetLink) ?? meeting;
		const normalizedTitle = typeof meeting.title === "string" ? meeting.title.trim() : "";
		const startTimeMs = Number.isFinite(meeting.startTimeMs) ? meeting.startTimeMs : null;
		const endTimeMs = Number.isFinite(meeting.endTimeMs) ? meeting.endTimeMs : null;
		if (normalizedTitle && startTimeMs && endTimeMs) return pool.find((candidate) => candidate.title === normalizedTitle && candidate.startTimeMs === startTimeMs && candidate.endTimeMs === endTimeMs) ?? meeting;
		return meeting;
	};
	const openInSiteMeeting = (meeting) => {
		const resolvedMeeting = resolveMeetingRecord(meeting);
		setActiveInSiteMeeting(resolvedMeeting);
		setRoomUrlState(resolvedMeeting?.roomName ?? extractRoomNameFromMeetingLink(resolvedMeeting?.meetLink));
	};
	const closeMeetingRoom = () => {
		setActiveInSiteMeeting(null);
		setRoomUrlState(null);
	};
	const sharedRoomResolvedMeeting = (() => {
		if (!sharedRoomName) return null;
		return sharedRoomMeeting ?? upcomingMeetings.find((meeting) => meeting.roomName === sharedRoomName) ?? null;
	})();
	const effectiveActiveInSiteMeeting = (() => {
		if (activeInSiteMeeting) return resolveMeetingRecord(activeInSiteMeeting);
		if (sharedRoomResolvedMeeting) return resolveMeetingRecord(sharedRoomResolvedMeeting);
		return null;
	})();
	const handleStartQuickMeet = (options) => {
		if (isPreviewMode) {
			notifyInfo({
				title: "Preview mode",
				message: "Meeting launch is disabled while sample data is active."
			});
			return;
		}
		if (!canSchedule) {
			notifyFailure({
				title: "Read-only access",
				message: "Client users cannot start meetings."
			});
			return;
		}
		if (options.attendeeEmails.length === 0) {
			notifyFailure({
				title: "Add a participant",
				message: "Add at least one participant before starting a room."
			});
			return;
		}
		if (!resolvedGoogleWorkspaceStatus?.connected) {
			notifyFailure({
				title: "Google Workspace required",
				message: "Connect Google Workspace before starting a meeting room."
			});
			return;
		}
		setQuickStarting(true);
		const quickMeetClientId = selectedClientId === void 0 ? null : selectedClientId;
		apiFetch("/api/meetings/quick", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				...options,
				clientId: quickMeetClientId
			}),
			timeoutMs: MEETING_ACTION_TIMEOUT_MS
		}).then((payload) => {
			const meeting = payload.data?.meeting ?? payload.meeting;
			const notificationSummary = payload.data?.notificationSummary ?? payload.notificationSummary;
			if (!meeting) {
				notifyFailure({
					title: "Meeting launch failed",
					message: "The room started without a meeting record."
				});
				return;
			}
			handleMeetingUpdated(meeting);
			setActiveInSiteMeeting(meeting);
			setRoomUrlState(meeting.roomName ?? null);
			setQuickMeetDialogOpen(false);
			resetQuickMeetForm();
			notifySuccess({
				title: "Meeting room started",
				message: describeNotificationSummary(notificationSummary, {
					none: "Your Cohorts room is ready. No invite emails were sent.",
					allSent: (sent, skipped) => {
						const skippedText = skipped > 0 ? ` ${pluralize(skipped, "recipient")} skipped.` : "";
						return `Your Cohorts room is ready. ${pluralize(sent, "invite email")} sent.${skippedText}`;
					},
					partial: (sent, failed, skipped) => {
						const skippedText = skipped > 0 ? ` ${pluralize(skipped, "recipient")} skipped.` : "";
						return `Your Cohorts room is ready. ${pluralize(sent, "invite email")} sent and ${pluralize(failed, "email delivery", "email deliveries")} failed.${skippedText}`;
					},
					failed: (failed, skipped) => {
						const skippedText = skipped > 0 ? ` ${pluralize(skipped, "recipient")} were skipped.` : "";
						return `Your Cohorts room is ready, but ${pluralize(failed, "invite email delivery", "invite email deliveries")} failed.${skippedText}`;
					}
				})
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "useMeetingsPageController:openInSiteMeeting",
				title: "Meeting launch failed",
				fallbackMessage: "Unable to start meeting room."
			});
		}).finally(() => {
			setQuickStarting(false);
		});
	};
	const handleRescheduleMeeting = (meeting) => {
		setEditingMeetingId(meeting.legacyId);
		setTitle(meeting.title);
		setDescription(meeting.description ?? "");
		setMeetingDate(new Date(meeting.startTimeMs));
		setMeetingTime(toTimeValue(meeting.startTimeMs));
		setDurationMinutes(String(Math.max(15, Math.round((meeting.endTimeMs - meeting.startTimeMs) / 6e4))));
		setTimezone(meeting.timezone);
		scheduleAttendees.setInput("");
		scheduleAttendees.setEmails(meeting.attendeeEmails);
	};
	const handleCancelMeeting = (meeting) => {
		if (isPreviewMode) {
			notifyInfo({
				title: "Preview mode",
				message: `"${meeting.title}" is sample data and cannot be updated.`
			});
			return;
		}
		if (!canSchedule) {
			notifyFailure({
				title: "Read-only access",
				message: "Client users cannot cancel meetings."
			});
			return;
		}
		setCancelDialogMeeting(meeting);
	};
	const handleConfirmCancelMeeting = () => {
		const meeting = cancelDialogMeeting;
		if (!meeting) return;
		setCancellingMeetingId(meeting.legacyId);
		apiFetch("/api/meetings/cancel", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ legacyId: meeting.legacyId }),
			timeoutMs: MEETING_ACTION_TIMEOUT_MS
		}).then((payload) => {
			if (editingMeetingId === meeting.legacyId) resetScheduleForm();
			setCancelDialogMeeting(null);
			notifySuccess({
				title: "Meeting cancelled",
				message: describeNotificationSummary(payload.data?.notificationSummary, {
					none: "Meeting cancelled. No cancellation emails were sent.",
					allSent: (sent, skipped) => {
						const skippedText = skipped > 0 ? ` ${pluralize(skipped, "recipient")} skipped.` : "";
						return `Meeting cancelled. ${pluralize(sent, "cancellation email")} sent.${skippedText}`;
					},
					partial: (sent, failed, skipped) => {
						const skippedText = skipped > 0 ? ` ${pluralize(skipped, "recipient")} skipped.` : "";
						return `Meeting cancelled. ${pluralize(sent, "cancellation email")} sent and ${pluralize(failed, "email delivery", "email deliveries")} failed.${skippedText}`;
					},
					failed: (failed, skipped) => {
						const skippedText = skipped > 0 ? ` ${pluralize(skipped, "recipient")} were skipped.` : "";
						return `Meeting cancelled, but ${pluralize(failed, "cancellation email delivery", "cancellation email deliveries")} failed.${skippedText}`;
					}
				})
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "useMeetingsPageController:cancelMeeting",
				title: "Cancel failed",
				fallbackMessage: "Unable to cancel meeting."
			});
		}).finally(() => {
			setCancellingMeetingId(null);
		});
	};
	const handleScheduleMeeting = (event) => {
		event.preventDefault();
		const { attendeeEmails, hasPendingInvalidInput, hasParticipants } = scheduleAttendeeDraft;
		if (isPreviewMode) {
			notifyInfo({
				title: "Preview mode",
				message: "Scheduling is disabled while sample meeting data is active."
			});
			return;
		}
		if (!canSchedule) {
			notifyFailure({
				title: "Read-only access",
				message: "Client users can view meetings but cannot schedule them."
			});
			return;
		}
		if (hasPendingInvalidInput) {
			notifyFailure({
				title: "Invalid attendee email",
				message: "Enter a valid email before scheduling the meeting."
			});
			return;
		}
		if (!hasParticipants) {
			notifyFailure({
				title: "Add a participant",
				message: "Add at least one participant before scheduling a meeting."
			});
			return;
		}
		if (!meetingDate) {
			notifyFailure({
				title: "Missing date",
				message: "Choose a meeting date before scheduling."
			});
			return;
		}
		const [hoursRaw, minutesRaw] = meetingTime.split(":");
		const parsedHours = Number(hoursRaw);
		const parsedMinutes = Number(minutesRaw);
		const start = new Date(meetingDate);
		start.setHours(parsedHours, parsedMinutes, 0, 0);
		const duration = Number(durationMinutes);
		const normalizedTitle = title.replace(/\s+/g, " ").trim();
		if (!Number.isFinite(start.getTime()) || !Number.isFinite(duration) || duration <= 0 || !Number.isFinite(parsedHours) || !Number.isFinite(parsedMinutes)) {
			notifyFailure({
				title: "Invalid schedule",
				message: "Please provide a valid start time and duration."
			});
			return;
		}
		const startTimeMs = start.getTime();
		const endTimeMs = startTimeMs + duration * 6e4;
		const now = Date.now();
		if (normalizedTitle.length < 3) {
			notifyFailure({
				title: "Title too short",
				message: "Meeting titles should be at least 3 characters long."
			});
			return;
		}
		if (normalizedTitle.length > 120) {
			notifyFailure({
				title: "Title too long",
				message: "Meeting titles must stay within 120 characters."
			});
			return;
		}
		if (startTimeMs < now + 5 * 6e4) {
			notifyFailure({
				title: "Start time too soon",
				message: "Schedule meetings at least 5 minutes in advance."
			});
			return;
		}
		if (startTimeMs > now + 365 * 24 * 60 * 60 * 1e3) {
			notifyFailure({
				title: "Start time too far away",
				message: "Meetings cannot be scheduled more than 12 months ahead."
			});
			return;
		}
		if (endTimeMs - startTimeMs < 10 * 6e4 || endTimeMs - startTimeMs > 480 * 60 * 1e3) {
			notifyFailure({
				title: "Invalid duration",
				message: "Meetings must be between 10 minutes and 8 hours long."
			});
			return;
		}
		if (editingMeeting?.status === "cancelled") {
			notifyFailure({
				title: "Cannot edit cancelled meeting",
				message: "Create a new meeting instead."
			});
			return;
		}
		setScheduling(true);
		const isEditing = Boolean(editingMeeting);
		const endpoint = isEditing ? "/api/meetings/reschedule" : "/api/meetings/schedule";
		const legacyId = editingMeeting ? editingMeeting.legacyId : void 0;
		const trimmedDescription = description.trim();
		const payloadDescription = trimmedDescription.length > 0 ? trimmedDescription : null;
		apiFetch(endpoint, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				legacyId,
				title: normalizedTitle,
				description: payloadDescription,
				startTimeMs,
				endTimeMs,
				timezone,
				attendeeEmails,
				clientId: selectedClientId === void 0 ? null : selectedClientId
			}),
			timeoutMs: MEETING_ACTION_TIMEOUT_MS
		}).then((payload) => {
			const meetLink = payload.data?.meeting?.meetLink ?? payload.meeting?.meetLink;
			const notificationSummary = payload.data?.notificationSummary ?? payload.notificationSummary;
			if (isEditing) notifySuccess({
				title: "Meeting rescheduled",
				message: describeNotificationSummary(notificationSummary, {
					none: "Updated details were saved. No reschedule emails were sent.",
					allSent: (sent, skipped) => {
						const skippedText = skipped > 0 ? ` ${pluralize(skipped, "recipient")} skipped.` : "";
						return `Updated details were saved and ${pluralize(sent, "reschedule email")} sent.${skippedText}`;
					},
					partial: (sent, failed, skipped) => {
						const skippedText = skipped > 0 ? ` ${pluralize(skipped, "recipient")} skipped.` : "";
						return `Updated details were saved. ${pluralize(sent, "reschedule email")} sent and ${pluralize(failed, "email delivery", "email deliveries")} failed.${skippedText}`;
					},
					failed: (failed, skipped) => {
						const skippedText = skipped > 0 ? ` ${pluralize(skipped, "recipient")} were skipped.` : "";
						return `Updated details were saved, but ${pluralize(failed, "reschedule email delivery", "reschedule email deliveries")} failed.${skippedText}`;
					}
				})
			});
			else notifySuccess({
				title: "Meeting scheduled",
				message: describeNotificationSummary(notificationSummary, {
					none: meetLink ? "Meeting saved and your room link is ready. No invite emails were sent." : "Meeting saved successfully. No invite emails were sent.",
					allSent: (sent, skipped) => {
						const skippedText = skipped > 0 ? ` ${pluralize(skipped, "recipient")} skipped.` : "";
						const linkText = meetLink ? " Your room link is ready." : "";
						return `${pluralize(sent, "invite email")} sent.${linkText}${skippedText}`;
					},
					partial: (sent, failed, skipped) => {
						const skippedText = skipped > 0 ? ` ${pluralize(skipped, "recipient")} skipped.` : "";
						const linkText = meetLink ? " Your room link is ready." : "";
						return `${pluralize(sent, "invite email")} sent and ${pluralize(failed, "email delivery", "email deliveries")} failed.${linkText}${skippedText}`;
					},
					failed: (failed, skipped) => {
						const skippedText = skipped > 0 ? ` ${pluralize(skipped, "recipient")} were skipped.` : "";
						const linkText = meetLink ? " Your room link is ready." : "";
						return `Meeting saved, but ${pluralize(failed, "invite email delivery", "invite email deliveries")} failed.${linkText}${skippedText}`;
					}
				})
			});
			resetScheduleForm();
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "useMeetingsPageController:scheduleMeeting",
				title: isEditing ? "Reschedule failed" : "Schedule failed",
				fallbackMessage: "Unable to schedule meeting."
			});
		}).finally(() => {
			setScheduling(false);
		});
	};
	const handleSubmitQuickMeet = (event) => {
		event.preventDefault();
		const { attendeeEmails, hasPendingInvalidInput, hasParticipants } = quickAttendeeDraft;
		const duration = Number(quickMeetDurationMinutes);
		if (!Number.isFinite(duration) || duration < 10 || duration > 240) {
			notifyFailure({
				title: "Invalid duration",
				message: "Quick meet duration must be between 10 and 240 minutes."
			});
			return;
		}
		if (hasPendingInvalidInput) {
			notifyFailure({
				title: "Invalid attendee email",
				message: "Enter a valid email before starting the room."
			});
			return;
		}
		if (!hasParticipants) {
			notifyFailure({
				title: "Add a participant",
				message: "Add at least one participant before starting a room."
			});
			return;
		}
		handleStartQuickMeet({
			title: quickMeetTitle.trim().length > 0 ? quickMeetTitle.trim() : "Instant Cohorts Room",
			description: quickMeetDescription.trim().length > 0 ? quickMeetDescription.trim() : null,
			durationMinutes: Math.floor(duration),
			attendeeEmails,
			timezone
		});
	};
	const handleMarkCompleted = async (legacyId) => {
		if (isPreviewMode) {
			notifyInfo({
				title: "Preview mode",
				message: "Sample meeting statuses cannot be updated."
			});
			return;
		}
		if (!workspaceId || !canSchedule) return;
		try {
			await updateMeetingStatus({
				workspaceId,
				legacyId,
				status: "completed"
			});
			setMeetingOverrides((current) => {
				const existingMeeting = current[legacyId] ?? upcomingMeetings.find((meeting) => meeting.legacyId === legacyId);
				if (!existingMeeting) return current;
				return {
					...current,
					[legacyId]: {
						...existingMeeting,
						status: "completed"
					}
				};
			});
			setActiveInSiteMeeting((current) => current?.legacyId === legacyId ? {
				...current,
				status: "completed"
			} : current);
			notifySuccess({
				title: "Meeting updated",
				message: "Status marked as completed."
			});
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useMeetingsPageController:markCompleted",
				title: "Status update failed",
				fallbackMessage: "Unable to update meeting status."
			});
		}
	};
	return {
		isPreviewMode,
		canSchedule,
		scheduling,
		quickStarting,
		cancellingMeetingId,
		cancelDialogMeeting,
		resolvedGoogleWorkspaceStatus,
		googleWorkspaceStatusLoading,
		resolvedActiveInSiteMeeting: effectiveActiveInSiteMeeting,
		editingMeeting,
		sharedRoomName,
		title,
		description,
		meetingDate,
		meetingTime,
		durationMinutes,
		timezone,
		quickMeetDialogOpen,
		quickMeetTitle,
		quickMeetDescription,
		quickMeetDurationMinutes,
		scheduleAttendees,
		quickAttendees,
		scheduleAttendeeDraft,
		quickAttendeeDraft,
		scheduleRequiresGoogleWorkspace,
		scheduleDisabled,
		upcomingMeetings,
		upcomingMeetingsLoading,
		meetingsQueryError,
		setTitle,
		setDescription,
		setMeetingDate,
		setMeetingTime,
		setDurationMinutes,
		setTimezone,
		setQuickMeetDialogOpen,
		setQuickMeetTitle,
		setQuickMeetDescription,
		setQuickMeetDurationMinutes,
		setCancelDialogMeeting,
		closeMeetingRoom,
		resetQuickMeetForm,
		resetScheduleForm,
		handleMeetingUpdated,
		handleConnectGoogleWorkspace,
		handleDisconnectGoogleWorkspace,
		handleSubmitQuickMeet,
		handleScheduleMeeting,
		handleRescheduleMeeting,
		handleCancelMeeting,
		handleConfirmCancelMeeting,
		handleMarkCompleted,
		openInSiteMeeting
	};
}
var MeetingsPageContext = (0, import_react.createContext)(null);
function MeetingsPageProvider({ children }) {
	const controller = useMeetingsPageController();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingsPageContext.Provider, {
		value: controller,
		children
	});
}
function useMeetingsPageContext() {
	const context = (0, import_react.use)(MeetingsPageContext);
	if (!context) throw new Error("useMeetingsPageContext must be used within a MeetingsPageProvider");
	return context;
}
var ROOMS = [
	"room-1",
	"room-2",
	"room-3",
	"room-4",
	"room-5",
	"room-6"
];
var AVATARS = [
	"av-1",
	"av-2",
	"av-3"
];
function MeetingsPageSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-32" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-56" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-36 rounded-md" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 rounded-lg border p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-5 shrink-0 rounded-full" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-56" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "ml-auto h-8 w-24 rounded-md" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
				children: ROOMS.map((roomId) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 rounded-lg border p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-36" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-24" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-14 rounded-full" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex",
								children: AVATARS.map((avatarId, avatarIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: cn("size-7 rounded-full ring-2 ring-background", avatarIndex > 0 && "-ml-2") }, avatarId))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-20" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-full rounded-md" })
					]
				}, roomId))
			})
		]
	});
}
function MeetingsPageShellBoundary({ loading, queryError, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageSkeletonBoundary, {
		loading,
		loadingContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingsPageSkeleton, {}),
		children: [queryError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryErrorAlert, {
			error: queryError,
			title: "Unable to load meetings"
		}) : null, children]
	});
}
async function postMeetingTranscriptAction({ legacyId, mode, markCompleted, source = "in-site-voice", transcriptText, notesSummary, keepalive }) {
	const response = await fetch("/api/meetings/transcript", {
		method: "POST",
		keepalive,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			legacyId,
			mode,
			markCompleted,
			source,
			transcriptText,
			notesSummary
		})
	});
	const payload = await response.json().catch(() => ({}));
	if (!response.ok || payload.success === false) throw new Error(payload.error || "Meeting update failed");
	return payload.data ?? {};
}
function useInSiteMeetingRoomPostCall({ meetingLegacyId, markCompleted, normalizedTranscript, transcriptDraft, transcriptSource, canPersist, canGenerateNotes, onClose, onMeetingUpdated, buildMeetingSnapshot, applyTranscriptActionResult, setMarkCompleted, setFinalizingSession, setTranscriptSource, setTranscriptProcessingState, setTranscriptProcessingError, setNotesProcessingState, setNotesProcessingError, setNotesReason, setGeneratingNotes, setRetryingPostCallProcessing, setOperationsOpen, setJoinConfig, setInterimTranscript, setAutoSyncing, setLastAutoSyncAt, setLastAutoSyncedTranscript, finalizationInFlightRef }) {
	const submitTranscriptAction = async (mode, overrides) => {
		if (!meetingLegacyId) throw new Error("This meeting record is missing an ID. Refresh and reopen the room.");
		return postMeetingTranscriptAction({
			legacyId: meetingLegacyId,
			mode,
			markCompleted: overrides?.markCompleted ?? markCompleted,
			source: overrides?.source ?? "in-site-voice",
			transcriptText: overrides?.transcriptText,
			notesSummary: overrides?.notesSummary,
			keepalive: overrides?.keepalive
		});
	};
	const finalizeMeetingAfterRoomExit = (closeAfterKickoff) => {
		if (!canPersist || finalizationInFlightRef.current) {
			if (closeAfterKickoff) onClose();
			return;
		}
		finalizationInFlightRef.current = true;
		const hasEnoughTranscript = normalizedTranscript.length >= 20;
		const optimisticMeeting = buildMeetingSnapshot({
			status: "completed",
			transcriptText: normalizedTranscript || transcriptDraft,
			transcriptSource: "livekit-browser-voice",
			transcriptProcessingState: hasEnoughTranscript ? "processing" : "idle",
			transcriptProcessingError: null,
			notesProcessingState: hasEnoughTranscript ? "processing" : "idle",
			notesProcessingError: null
		});
		setMarkCompleted(true);
		setFinalizingSession(hasEnoughTranscript);
		setTranscriptSource("livekit-browser-voice");
		setTranscriptProcessingState(hasEnoughTranscript ? "processing" : "idle");
		setTranscriptProcessingError(null);
		setNotesProcessingState(hasEnoughTranscript ? "processing" : "idle");
		setNotesProcessingError(null);
		setOperationsOpen(true);
		onMeetingUpdated?.(optimisticMeeting);
		const finalizePromise = submitTranscriptAction("finalize-post-meeting", {
			transcriptText: normalizedTranscript,
			source: "livekit-browser-voice",
			markCompleted: true,
			keepalive: closeAfterKickoff
		});
		if (closeAfterKickoff) {
			setJoinConfig(null);
			setInterimTranscript("");
			onClose();
			finalizePromise.catch((error) => {
				const message = error instanceof Error ? error.message : "Meeting finalization failed";
				onMeetingUpdated?.(buildMeetingSnapshot({
					status: "completed",
					transcriptProcessingState: "failed",
					transcriptProcessingError: message,
					notesProcessingState: "failed",
					notesProcessingError: "AI notes could not be generated because post-call finalization failed."
				}));
			}).finally(() => {
				finalizationInFlightRef.current = false;
			});
			return;
		}
		finalizePromise.then((result) => {
			setLastAutoSyncedTranscript(normalizedTranscript);
			applyTranscriptActionResult(result);
		}).catch((error) => {
			const message = error instanceof Error ? error.message : "Meeting finalization failed";
			setTranscriptProcessingState("failed");
			setTranscriptProcessingError(message);
			setNotesProcessingState("failed");
			setNotesProcessingError("AI notes could not be generated because post-call finalization failed.");
			setFinalizingSession(false);
			onMeetingUpdated?.(buildMeetingSnapshot({
				status: "completed",
				transcriptProcessingState: "failed",
				transcriptProcessingError: message,
				notesProcessingState: "failed",
				notesProcessingError: "AI notes could not be generated because post-call finalization failed."
			}));
		}).finally(() => {
			finalizationInFlightRef.current = false;
		});
	};
	const handleGenerateNotes = async () => {
		if (!canGenerateNotes) {
			notifyFailure({
				title: "Transcript too short",
				message: "Capture a bit more conversation before generating AI meeting notes."
			});
			return;
		}
		setGeneratingNotes(true);
		setNotesProcessingState("processing");
		setNotesProcessingError(null);
		try {
			const result = await submitTranscriptAction("save-transcript-and-generate-notes", {
				transcriptText: normalizedTranscript,
				source: "livekit-browser-voice"
			});
			setLastAutoSyncedTranscript(normalizedTranscript);
			applyTranscriptActionResult(result);
			if (result.notesGenerated) notifySuccess({
				title: "AI summary updated",
				message: "The room sidebar now reflects the latest generated summary."
			});
			else if (result.notesReason === "ai_not_configured") notifyFailure({
				title: "AI notes unavailable",
				message: "Gemini is not configured for meeting note generation in this environment."
			});
			else if (result.notesReason === "generation_failed") notifyFailure({
				title: "AI summary failed",
				message: "The request completed, but note generation failed. Try again after more transcript is captured."
			});
		} catch (error) {
			setNotesProcessingState("failed");
			setNotesProcessingError(error instanceof Error ? error.message : "Unknown error");
			reportConvexFailure({
				error,
				context: "useInSiteMeetingRoomPostCall:generateNotes",
				title: "AI summary failed",
				fallbackMessage: "Unable to generate meeting notes."
			});
		} finally {
			setGeneratingNotes(false);
		}
	};
	const handleRetryPostCallProcessing = async () => {
		if (!canPersist) {
			notifyFailure({
				title: "Post-call retry unavailable",
				message: "This meeting cannot persist transcript updates in the current environment."
			});
			return;
		}
		if (normalizedTranscript.length < 20) {
			notifyFailure({
				title: "Transcript too short",
				message: "Capture a little more conversation before retrying post-call processing."
			});
			return;
		}
		if (finalizationInFlightRef.current) return;
		finalizationInFlightRef.current = true;
		setRetryingPostCallProcessing(true);
		setMarkCompleted(true);
		setFinalizingSession(true);
		setNotesReason(null);
		setTranscriptSource((current) => current ?? "livekit-browser-voice");
		setTranscriptProcessingState("processing");
		setTranscriptProcessingError(null);
		setNotesProcessingState("processing");
		setNotesProcessingError(null);
		setOperationsOpen(true);
		onMeetingUpdated?.(buildMeetingSnapshot({
			status: "completed",
			transcriptSource: transcriptSource ?? "livekit-browser-voice",
			transcriptProcessingState: "processing",
			transcriptProcessingError: null,
			notesProcessingState: "processing",
			notesProcessingError: null
		}));
		try {
			const result = await submitTranscriptAction("finalize-post-meeting", {
				transcriptText: normalizedTranscript,
				source: transcriptSource ?? "livekit-browser-voice",
				markCompleted: true
			});
			setLastAutoSyncedTranscript(normalizedTranscript);
			applyTranscriptActionResult(result);
			notifySuccess({
				title: "Post-call processing retried",
				message: "Transcript finalization and AI notes generation are running again."
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : "Meeting finalization failed";
			setTranscriptProcessingState("failed");
			setTranscriptProcessingError(message);
			setNotesProcessingState("failed");
			setNotesProcessingError("AI notes could not be generated because post-call finalization failed.");
			setFinalizingSession(false);
			onMeetingUpdated?.(buildMeetingSnapshot({
				status: "completed",
				transcriptProcessingState: "failed",
				transcriptProcessingError: message,
				notesProcessingState: "failed",
				notesProcessingError: "AI notes could not be generated because post-call finalization failed."
			}));
			notifyFailure({
				title: "Post-call retry failed",
				message
			});
		} finally {
			setRetryingPostCallProcessing(false);
			finalizationInFlightRef.current = false;
		}
	};
	const performAutoSync = (transcript) => {
		setAutoSyncing(true);
		const mode = transcript.length >= 80 ? "save-transcript-and-generate-notes" : "save-transcript";
		submitTranscriptAction(mode, {
			transcriptText: transcript,
			source: "livekit-browser-voice"
		}).then((data) => {
			setLastAutoSyncedTranscript(transcript);
			setLastAutoSyncAt(Date.now());
			applyTranscriptActionResult(data);
		}).catch((error) => {
			const message = error instanceof Error ? error.message : "Room automation sync failed";
			logError(error, "useInSiteMeetingRoomPostCall:autoSyncTranscript");
			if (mode === "save-transcript-and-generate-notes") {
				setNotesReason("generation_failed");
				setNotesProcessingState("failed");
				setNotesProcessingError(message);
			} else setTranscriptProcessingError(message);
		}).finally(() => {
			setAutoSyncing(false);
		});
	};
	return {
		submitTranscriptAction,
		finalizeMeetingAfterRoomExit,
		handleGenerateNotes,
		handleRetryPostCallProcessing,
		performAutoSync
	};
}
function useInSiteMeetingRoomController(props) {
	const { meeting, onClose, canRecord = true, onMeetingUpdated, fallbackRoomName } = props;
	const liveRoomLayoutContext = ca();
	const [transcriptDraft, setTranscriptDraft] = (0, import_react.useState)(meeting.transcriptText ?? "");
	const [interimTranscript, setInterimTranscript] = (0, import_react.useState)("");
	const [markCompleted, setMarkCompleted] = (0, import_react.useState)(meeting.status === "completed");
	const [transcriptSavedAt, setTranscriptSavedAt] = (0, import_react.useState)(meeting.transcriptUpdatedAtMs ?? null);
	const [transcriptSource, setTranscriptSource] = (0, import_react.useState)(meeting.transcriptSource ?? null);
	const [transcriptProcessingState, setTranscriptProcessingState] = (0, import_react.useState)(() => normalizeMeetingProcessingState(meeting.transcriptProcessingState));
	const [transcriptProcessingError, setTranscriptProcessingError] = (0, import_react.useState)(meeting.transcriptProcessingError ?? null);
	const [notesUpdatedAt, setNotesUpdatedAt] = (0, import_react.useState)(meeting.notesUpdatedAtMs ?? null);
	const [notesModel, setNotesModel] = (0, import_react.useState)(meeting.notesModel ?? null);
	const [summaryPreview, setSummaryPreview] = (0, import_react.useState)(meeting.notesSummary ?? null);
	const [notesProcessingState, setNotesProcessingState] = (0, import_react.useState)(() => normalizeMeetingProcessingState(meeting.notesProcessingState));
	const [notesProcessingError, setNotesProcessingError] = (0, import_react.useState)(meeting.notesProcessingError ?? null);
	const [notesReason, setNotesReason] = (0, import_react.useState)(null);
	const [notesStorageId, setNotesStorageId] = (0, import_react.useState)(meeting.notesStorageId ?? null);
	const [transcriptStorageId, setTranscriptStorageId] = (0, import_react.useState)(meeting.transcriptStorageId ?? null);
	const [transcriptTruncatedForNotes, setTranscriptTruncatedForNotes] = (0, import_react.useState)(false);
	const [operationsOpen, setOperationsOpen] = (0, import_react.useState)(false);
	const [generatingNotes, setGeneratingNotes] = (0, import_react.useState)(false);
	const [finalizingSession, setFinalizingSession] = (0, import_react.useState)(false);
	const [retryingPostCallProcessing, setRetryingPostCallProcessing] = (0, import_react.useState)(false);
	const [joinConfig, setJoinConfig] = (0, import_react.useState)(null);
	const [joiningRoom, setJoiningRoom] = (0, import_react.useState)(false);
	const [joinError, setJoinError] = (0, import_react.useState)(null);
	const [isMinimizedPreference, setIsMinimizedPreference] = (0, import_react.useState)(false);
	const isMobileViewport = (0, import_react.useSyncExternalStore)((onStoreChange) => {
		if (typeof window === "undefined") return () => void 0;
		const media = window.matchMedia("(max-width: 767px)");
		const updateViewport = () => {
			onStoreChange();
		};
		updateViewport();
		if (typeof media.addEventListener === "function") {
			media.addEventListener("change", updateViewport);
			return () => {
				media.removeEventListener("change", updateViewport);
			};
		}
		media.addListener(updateViewport);
		return () => {
			media.removeListener(updateViewport);
		};
	}, () => {
		if (typeof window === "undefined") return false;
		return window.matchMedia("(max-width: 767px)").matches;
	}, () => false);
	const pipSupported = typeof document !== "undefined" && Boolean(document.pictureInPictureEnabled || typeof HTMLVideoElement !== "undefined" && "webkitSetPresentationMode" in HTMLVideoElement.prototype);
	const isMinimized = Boolean(joinConfig) && !isMobileViewport && isMinimizedPreference;
	const [pipActive, setPipActive] = (0, import_react.useState)(false);
	const [transcriptRecordingEnabled, setTranscriptRecordingEnabled] = (0, import_react.useState)(() => Boolean(meeting.transcriptText?.trim()));
	const autoCaptureEnabled = transcriptRecordingEnabled && canRecord;
	const [captureStatus, setCaptureStatus] = (0, import_react.useState)({
		supported: false,
		listening: false,
		error: null
	});
	const [autoSyncing, setAutoSyncing] = (0, import_react.useState)(false);
	const [lastAutoSyncAt, setLastAutoSyncAt] = (0, import_react.useState)(meeting.transcriptUpdatedAtMs ?? null);
	const [lastAutoSyncedTranscript, setLastAutoSyncedTranscript] = (0, import_react.useState)(meeting.transcriptText?.trim() ?? "");
	const settingsDrivenOpenRef = (0, import_react.useRef)(false);
	const finalizationInFlightRef = (0, import_react.useRef)(false);
	const roomViewportRef = (0, import_react.useRef)(null);
	const meetingLegacyId = typeof meeting.legacyId === "string" ? meeting.legacyId : "";
	const meetingCalendarEventId = typeof meeting.calendarEventId === "string" && meeting.calendarEventId.trim().length > 0 ? meeting.calendarEventId : null;
	const meetingStatus = typeof meeting.status === "string" && meeting.status.length > 0 ? meeting.status : "scheduled";
	const meetingTimezone = typeof meeting.timezone === "string" && meeting.timezone.trim().length > 0 ? meeting.timezone : "UTC";
	const meetingDescription = typeof meeting.description === "string" && meeting.description.trim().length > 0 ? meeting.description : null;
	const meetingLink = typeof meeting.meetLink === "string" && meeting.meetLink.length > 0 ? meeting.meetLink : null;
	const persistedMeetingRoomName = (typeof meeting.roomName === "string" && meeting.roomName.trim().length > 0 ? meeting.roomName.trim() : null) ?? extractRoomNameFromMeetingLink(meetingLink) ?? (typeof fallbackRoomName === "string" && fallbackRoomName.trim().length > 0 ? fallbackRoomName.trim() : null);
	const meetingRoomName = persistedMeetingRoomName ?? buildFallbackRoomName({
		title: meeting.title,
		startTimeMs: meeting.startTimeMs,
		endTimeMs: meeting.endTimeMs
	});
	const meetingTitle = typeof meeting.title === "string" && meeting.title.trim().length > 0 ? meeting.title.trim() : formatMeetingTitleFromRoomName(meetingRoomName) ?? "Meeting room";
	const meetingAttendeeEmails = Array.isArray(meeting.attendeeEmails) ? meeting.attendeeEmails : [];
	const isPreviewMeeting = meetingLegacyId.startsWith("preview-");
	const hasJoinReference = Boolean(meetingLegacyId || meetingCalendarEventId || meetingRoomName);
	const inlineJoinError = !isPreviewMeeting && !hasJoinReference ? "This meeting record is missing its room reference. Refresh and reopen the room." : joinError;
	const roomActionLabel = joiningRoom ? "Joining..." : isPreviewMeeting ? "Preview only" : persistedMeetingRoomName ? "Join room" : "Start meet";
	const normalizedTranscript = transcriptDraft.trim();
	const canPersist = canRecord && !isPreviewMeeting && meetingLegacyId.length > 0;
	const canGenerateNotes = canPersist && normalizedTranscript.length >= 20;
	const settingsWidgetOpen = Boolean(liveRoomLayoutContext.widget.state?.showSettings);
	const roomPinnedToMobileTray = Boolean(joinConfig && isMobileViewport && isMinimized);
	const canMinimizeRoom = Boolean(joinConfig && isMobileViewport);
	const hasTranscriptPendingSync = normalizedTranscript.length >= 20 && normalizedTranscript !== lastAutoSyncedTranscript;
	const setRoomViewportElement = (node) => {
		roomViewportRef.current = node;
	};
	const getRoomVideoElement = () => {
		const root = roomViewportRef.current;
		if (!root) return null;
		const videos = Array.from(root.querySelectorAll("video"));
		return videos.find((video) => video.readyState >= 2) ?? videos[0] ?? null;
	};
	const appendTranscriptSnippet = (snippet) => {
		const normalized = snippet.trim();
		if (!normalized) return;
		setTranscriptDraft((current) => {
			const base = current.trim();
			if (!base) return normalized;
			if (base.endsWith(normalized)) return current;
			return `${base}\n${normalized}`;
		});
	};
	const buildMeetingSnapshot = (overrides = {}) => ({
		...meeting,
		transcriptText: transcriptDraft,
		transcriptUpdatedAtMs: transcriptSavedAt,
		transcriptSource,
		transcriptProcessingState,
		transcriptProcessingError,
		notesSummary: summaryPreview,
		notesUpdatedAtMs: notesUpdatedAt,
		notesModel,
		notesProcessingState,
		notesProcessingError,
		status: markCompleted ? "completed" : meeting.status,
		...overrides
	});
	const syncMeetingState = (updatedMeeting, options) => {
		onMeetingUpdated?.(updatedMeeting);
		setMarkCompleted(updatedMeeting.status === "completed");
		if (options.syncTranscript) {
			setTranscriptDraft(updatedMeeting.transcriptText ?? "");
			setLastAutoSyncedTranscript(updatedMeeting.transcriptText?.trim() ?? "");
		}
		setTranscriptSavedAt(updatedMeeting.transcriptUpdatedAtMs ?? null);
		setLastAutoSyncAt(updatedMeeting.transcriptUpdatedAtMs ?? null);
		setTranscriptSource(updatedMeeting.transcriptSource ?? null);
		setTranscriptProcessingState(normalizeMeetingProcessingState(updatedMeeting.transcriptProcessingState));
		setTranscriptProcessingError(updatedMeeting.transcriptProcessingError ?? null);
		setNotesUpdatedAt(updatedMeeting.notesUpdatedAtMs ?? null);
		setNotesModel(updatedMeeting.notesModel ?? null);
		setSummaryPreview(updatedMeeting.notesSummary ?? null);
		setNotesProcessingState(normalizeMeetingProcessingState(updatedMeeting.notesProcessingState));
		setNotesProcessingError(updatedMeeting.notesProcessingError ?? null);
		setNotesStorageId(updatedMeeting.notesStorageId ?? null);
		setTranscriptStorageId(updatedMeeting.transcriptStorageId ?? null);
		setFinalizingSession(normalizeMeetingProcessingState(updatedMeeting.transcriptProcessingState) === "processing" || normalizeMeetingProcessingState(updatedMeeting.notesProcessingState) === "processing");
		if (updatedMeeting.notesSummary) setNotesReason(null);
	};
	const applyTranscriptActionResult = (result) => {
		setNotesReason(result.notesReason ?? null);
		setTranscriptTruncatedForNotes(Boolean(result.transcriptTruncatedForNotes));
		if (result.notesReason !== "generation_failed") setNotesProcessingError(null);
		if (typeof result.summary === "string") setSummaryPreview(result.summary);
		if (result.model !== void 0) setNotesModel(result.model ?? null);
		if (result.meeting) syncMeetingState(result.meeting, {
			syncTranscript: true,
			syncNotes: true
		});
		if (!result.meeting) setFinalizingSession(false);
	};
	const { finalizeMeetingAfterRoomExit, handleGenerateNotes, handleRetryPostCallProcessing, performAutoSync } = useInSiteMeetingRoomPostCall({
		meetingLegacyId,
		markCompleted,
		normalizedTranscript,
		transcriptDraft,
		transcriptSource,
		canPersist,
		canGenerateNotes,
		onClose,
		onMeetingUpdated,
		buildMeetingSnapshot,
		applyTranscriptActionResult,
		setMarkCompleted,
		setFinalizingSession,
		setTranscriptSource,
		setTranscriptProcessingState,
		setTranscriptProcessingError,
		setNotesProcessingState,
		setNotesProcessingError,
		setNotesReason,
		setGeneratingNotes,
		setRetryingPostCallProcessing,
		setOperationsOpen,
		setJoinConfig,
		setInterimTranscript,
		setAutoSyncing,
		setLastAutoSyncAt,
		setLastAutoSyncedTranscript,
		finalizationInFlightRef
	});
	const handleJoinRoom = () => {
		if (isPreviewMeeting) {
			notifyInfo({
				title: "Preview room",
				message: "Live media is disabled in preview mode, but the workspace layout is available for review."
			});
			return;
		}
		if (!hasJoinReference) {
			setJoinError("This meeting record is missing its room reference. Refresh and reopen the room.");
			return;
		}
		setJoiningRoom(true);
		setJoinError(null);
		fetch("/api/meetings/livekit/token", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				legacyId: meetingLegacyId || void 0,
				calendarEventId: meetingCalendarEventId ?? void 0,
				roomName: meetingRoomName || void 0
			})
		}).then(async (response) => {
			const payload = await response.json().catch(() => ({}));
			if (!response.ok || payload.success === false || !payload.data) throw new Error(payload.error || "Unable to join the meeting room");
			if (payload.data.meeting) syncMeetingState(payload.data.meeting, {
				syncTranscript: false,
				syncNotes: false
			});
			if (payload.data.migration?.created) notifySuccess({
				title: "Native room prepared",
				message: payload.data.migration.calendarSyncWarning ?? "This legacy meeting was upgraded to a Cohorts room automatically."
			});
			setJoinConfig(payload.data);
			setOperationsOpen(true);
			if (!Boolean(payload.data.meeting?.transcriptText?.trim() || transcriptDraft.trim())) notifySuccess({
				title: "Room connected",
				message: "Start transcript recording when you are ready. Cohorts will transcribe speech, then generate guarded AI notes."
			});
			else setTranscriptRecordingEnabled(true);
		}).catch((error) => {
			setJoinError(error instanceof Error ? error.message : "Unable to join the meeting room");
		}).finally(() => {
			setJoiningRoom(false);
		});
	};
	const enableTranscriptRecording = () => {
		if (!canRecord) {
			notifyFailure({
				title: "Recording unavailable",
				message: "Transcript recording is disabled for this meeting room."
			});
			return;
		}
		setTranscriptRecordingEnabled(true);
		setOperationsOpen(true);
		notifySuccess({
			title: "Transcript recording enabled",
			message: "Allow microphone access when prompted. Speak naturally and Cohorts will build the transcript in the background."
		});
	};
	const togglePictureInPicture = async () => {
		if (!joinConfig) {
			notifyFailure({
				title: "Join the room first",
				message: "Picture in Picture becomes available once the LiveKit room is active."
			});
			return;
		}
		const video = getRoomVideoElement();
		if (!video) {
			notifyFailure({
				title: "Video unavailable",
				message: "Turn on camera or wait for a participant video tile before entering Picture in Picture."
			});
			return;
		}
		const webkitVideo = video;
		try {
			if (typeof document !== "undefined" && document.pictureInPictureElement && document.exitPictureInPicture) {
				await document.exitPictureInPicture();
				setPipActive(false);
				return;
			}
			if (typeof video.requestPictureInPicture === "function") {
				await video.requestPictureInPicture();
				setPipActive(true);
				return;
			}
			if (typeof webkitVideo.webkitSetPresentationMode === "function" && typeof webkitVideo.webkitSupportsPresentationMode === "function" && webkitVideo.webkitSupportsPresentationMode("picture-in-picture")) {
				const nextMode = webkitVideo.webkitPresentationMode === "picture-in-picture" ? "inline" : "picture-in-picture";
				webkitVideo.webkitSetPresentationMode(nextMode);
				setPipActive(nextMode === "picture-in-picture");
				return;
			}
			throw new Error("Picture in Picture is not supported in this browser.");
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useInSiteMeetingRoomController:enterPictureInPicture",
				title: "Picture in Picture unavailable",
				fallbackMessage: "Picture in Picture is not available in this browser."
			});
		}
	};
	const toggleMinimizedRoom = () => {
		if (!canMinimizeRoom) return;
		setIsMinimizedPreference((current) => !current);
	};
	const [prevJoinConfig, setPrevJoinConfig] = (0, import_react.useState)(joinConfig);
	if (joinConfig !== prevJoinConfig) {
		setPrevJoinConfig(joinConfig);
		if (!joinConfig) setPipActive(false);
	}
	(0, import_react.useEffect)(() => {
		if (joinConfig) return;
		if (typeof document !== "undefined" && document.pictureInPictureElement && document.exitPictureInPicture) document.exitPictureInPicture().catch(() => void 0);
	}, [joinConfig]);
	(0, import_react.useEffect)(() => {
		if (settingsWidgetOpen) {
			settingsDrivenOpenRef.current = true;
			setOperationsOpen(true);
			return;
		}
		if (settingsDrivenOpenRef.current) {
			settingsDrivenOpenRef.current = false;
			setOperationsOpen(false);
		}
	}, [settingsWidgetOpen]);
	const handleOperationsOpenChange = (open) => {
		setOperationsOpen(open);
		if (!open && settingsWidgetOpen) {
			settingsDrivenOpenRef.current = false;
			liveRoomLayoutContext.widget.dispatch?.({ msg: "toggle_settings" });
		}
	};
	(0, import_react.useEffect)(() => {
		if (!joinConfig || !canPersist || normalizedTranscript.length < 20) return;
		if (normalizedTranscript === lastAutoSyncedTranscript) return;
		const timeoutId = window.setTimeout(() => {
			performAutoSync(normalizedTranscript);
		}, 1e4);
		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [
		canPersist,
		joinConfig,
		lastAutoSyncedTranscript,
		normalizedTranscript,
		performAutoSync
	]);
	return {
		liveRoomLayoutContext,
		appendTranscriptSnippet,
		interimTranscript,
		setInterimTranscript,
		markCompleted,
		transcriptSavedAt,
		transcriptSource,
		transcriptProcessingState,
		transcriptProcessingError,
		notesUpdatedAt,
		notesModel,
		summaryPreview,
		notesProcessingState,
		notesProcessingError,
		notesReason,
		notesStorageId,
		transcriptStorageId,
		transcriptTruncatedForNotes,
		operationsOpen,
		setJoinError,
		generatingNotes,
		finalizingSession,
		retryingPostCallProcessing,
		joinConfig,
		setJoinConfig,
		joiningRoom,
		joinError,
		autoCaptureEnabled,
		transcriptRecordingEnabled,
		enableTranscriptRecording,
		captureStatus,
		setCaptureStatus,
		autoSyncing,
		lastAutoSyncAt,
		meetingStatus,
		meetingTimezone,
		meetingDescription,
		meetingLink,
		meetingRoomName,
		meetingTitle,
		meetingAttendeeEmails,
		isPreviewMeeting,
		hasJoinReference,
		inlineJoinError,
		roomActionLabel,
		normalizedTranscript,
		canPersist,
		canGenerateNotes,
		hasTranscriptPendingSync,
		roomPinnedToMobileTray,
		canMinimizeRoom,
		isMinimized,
		setIsMinimized: setIsMinimizedPreference,
		isMobileViewport,
		pipSupported,
		pipActive,
		setRoomViewportElement,
		togglePictureInPicture,
		toggleMinimizedRoom,
		handleJoinRoom,
		finalizeMeetingAfterRoomExit,
		handleGenerateNotes,
		handleRetryPostCallProcessing,
		handleOperationsOpenChange
	};
}
var livekit_exports = /* @__PURE__ */ __exportAll({});
__reExport(livekit_exports, dist_exports);
var PIPELINE_STEP_ENTER_INITIAL = {
	opacity: 0,
	y: 12
};
var PIPELINE_STEP_ENTER_ANIMATE = {
	opacity: 1,
	y: 0
};
function createPipelineSteps(props) {
	const { captureErrorPresent = false, captureListening, finalizingSession, hasTranscriptSaved, inRoom, notesProcessingState, recordingEnabled = false, summaryReady, transcriptProcessingState } = props;
	const hasCapturedContent = captureListening || hasTranscriptSaved || transcriptProcessingState === "processing" || notesProcessingState === "processing" || summaryReady;
	return [
		captureErrorPresent ? {
			label: "Capture",
			badge: "Check mic",
			variant: "destructive",
			description: "Capture needs attention before transcript syncing can continue."
		} : captureListening ? {
			label: "Capture",
			badge: "Recording",
			variant: "info",
			description: "Transcript lines are being captured live right now."
		} : hasCapturedContent ? {
			label: "Capture",
			badge: "Captured",
			variant: "secondary",
			description: "The meeting already has captured transcript content."
		} : inRoom && !recordingEnabled ? {
			label: "Capture",
			badge: "Start recording",
			variant: "outline",
			description: "The room is live. Start transcript recording when you are ready to capture speech."
		} : {
			label: "Capture",
			badge: "Waiting",
			variant: "outline",
			description: inRoom ? "Recording is armed. Speak naturally to build the transcript." : "Join the room to begin transcript capture."
		},
		transcriptProcessingState === "failed" ? {
			label: "Transcript",
			badge: "Needs attention",
			variant: "destructive",
			description: "Final transcript packaging failed. Review the latest processing error."
		} : finalizingSession || transcriptProcessingState === "processing" ? {
			label: "Transcript",
			badge: "Finalizing",
			variant: "info",
			description: "Post-call transcript finalization is currently running."
		} : hasTranscriptSaved ? {
			label: "Transcript",
			badge: "Saved",
			variant: "secondary",
			description: "A saved transcript is available for notes generation and review."
		} : {
			label: "Transcript",
			badge: "Waiting",
			variant: "outline",
			description: hasCapturedContent ? "Transcript will finish saving during sync or when the room wraps up." : "Waiting for transcript content first."
		},
		notesProcessingState === "failed" ? {
			label: "AI notes",
			badge: "Needs attention",
			variant: "destructive",
			description: "AI notes generation failed. Retry after more transcript is captured."
		} : notesProcessingState === "processing" ? {
			label: "AI notes",
			badge: "Generating",
			variant: "info",
			description: "AI notes are being generated from the saved transcript."
		} : summaryReady ? {
			label: "AI notes",
			badge: "Ready",
			variant: "secondary",
			description: "AI notes are ready to review."
		} : {
			label: "AI notes",
			badge: "Waiting",
			variant: "outline",
			description: hasTranscriptSaved ? "Transcript is ready. Generate notes now or wait for automatic post-call notes." : "Waiting for a saved transcript first."
		}
	];
}
function isActivePipelineBadge(badge) {
	return badge === "Recording" || badge === "Finalizing" || badge === "Generating";
}
function PipelineStepBadge({ badge, variant }) {
	const prefersReducedMotion = (0, motion_exports.useReducedMotion)();
	const active = isActivePipelineBadge(badge);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.AnimatePresence, {
		mode: "wait",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.span, {
			initial: prefersReducedMotion ? false : "hidden",
			animate: prefersReducedMotion ? void 0 : "visible",
			exit: prefersReducedMotion ? void 0 : "exit",
			variants: fadeVariants,
			className: "inline-flex",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant,
				className: cn(active && !prefersReducedMotion && "motion-reduce:animate-none"),
				children: active && !prefersReducedMotion ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion_exports.m.span, {
					className: "inline-flex items-center gap-1",
					variants: subtlePulseVariants,
					initial: "initial",
					animate: "animate",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "size-1.5 rounded-full bg-current opacity-80",
						"aria-hidden": true
					}), badge]
				}) : badge
			})
		}, badge)
	});
}
function MeetingAutomationPipeline(props) {
	const steps = createPipelineSteps(props);
	const prefersReducedMotion = (0, motion_exports.useReducedMotion)();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-2xl border border-border/70 bg-muted/20 p-3", props.className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.24em] text-muted-foreground",
				children: "Automation pipeline"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Capture → Transcript → AI notes"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "mt-3 grid gap-2 lg:grid-cols-3",
			children: steps.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.LazyMotion, {
				features: motion_exports.domAnimation,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion_exports.m.li, {
					className: cn("rounded-xl border border-border/60 bg-background p-3", listItemEnterClass),
					initial: prefersReducedMotion ? false : PIPELINE_STEP_ENTER_INITIAL,
					animate: prefersReducedMotion ? void 0 : PIPELINE_STEP_ENTER_ANIMATE,
					transition: {
						delay: index * .06,
						duration: .22
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-medium text-foreground",
							children: [
								index + 1,
								". ",
								step.label
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipelineStepBadge, {
							badge: step.badge,
							variant: step.variant
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs leading-5 text-muted-foreground",
						children: step.description
					})]
				})
			}, step.label))
		})]
	});
}
function MeetingRecordingPromptCard({ canRecord, captureError, captureSupported, inRoom, recordingEnabled, onEnableRecording, compact = false }) {
	const prefersReducedMotion = (0, motion_exports.useReducedMotion)();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.AnimatePresence, { children: inRoom && !recordingEnabled && canRecord ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.LazyMotion, {
		features: motion_exports.domAnimation,
		children: !captureSupported ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.div, {
			initial: prefersReducedMotion ? false : "hidden",
			animate: prefersReducedMotion ? void 0 : "visible",
			exit: prefersReducedMotion ? void 0 : "exit",
			variants: fadeInUpVariants,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
				className: compact ? "text-xs" : void 0,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Transcript recording unavailable" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: "This browser does not support live speech capture. Use Chrome on desktop for automatic meeting transcripts." })]
			})
		}, "unsupported") : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.div, {
			initial: prefersReducedMotion ? false : "hidden",
			animate: prefersReducedMotion ? void 0 : "visible",
			exit: prefersReducedMotion ? void 0 : "exit",
			variants: fadeInUpVariants,
			className: "rounded-2xl border border-warning/30 bg-warning/5 p-4 shadow-sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.28em] text-muted-foreground",
							children: "Record this meeting"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-foreground",
							children: "Start transcript capture when you are ready. Cohorts listens locally in your browser, saves the transcript, then generates Gemini meeting notes with guardrails after enough conversation is captured."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-2 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mt-0.5 size-3.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Allow microphone access when prompted. Only spoken content in the room is transcribed." })]
						}),
						captureError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-destructive",
							children: captureError
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					size: "sm",
					className: cn(pressableScaleClass),
					onClick: onEnableRecording,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-4" }), "Start recording transcript"]
				})]
			})
		}, "consent")
	}) : null });
}
var DEFAULT_MEETING_CHAT_MENTION_STATE = {
	active: false,
	startIndex: -1,
	query: ""
};
var MENTION_TRIGGER_LOOKBACK = 75;
function isMeetingChatMentionBoundary(value) {
	return !value || /[\s([{"']/.test(value);
}
function isMeetingChatAttachment(value) {
	if (!value || typeof value !== "object") return false;
	const record = value;
	return typeof record.name === "string" && typeof record.url === "string" && typeof record.type === "string" && typeof record.size === "string";
}
function parseMeetingChatParticipantMetadata(metadata) {
	if (typeof metadata !== "string" || metadata.trim().length === 0) return null;
	try {
		const parsed = JSON.parse(metadata);
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
		return parsed;
	} catch {
		return null;
	}
}
function buildMeetingChatMessageContent(input) {
	const text = input.text?.trim() ?? "";
	const attachments = Array.isArray(input.attachments) ? input.attachments.filter(isMeetingChatAttachment) : [];
	if (attachments.length === 0) return text;
	const payload = {
		type: "cohorts-meeting-chat",
		version: 1,
		text: text.length > 0 ? text : null,
		attachments
	};
	return JSON.stringify(payload);
}
function parseMeetingChatMessageContent(content) {
	if (!content.trim()) return {
		text: "",
		attachments: []
	};
	try {
		const parsed = JSON.parse(content);
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {
			text: content,
			attachments: []
		};
		const record = parsed;
		if (record.type !== "cohorts-meeting-chat") return {
			text: content,
			attachments: []
		};
		return {
			text: typeof record.text === "string" ? record.text : "",
			attachments: Array.isArray(record.attachments) ? record.attachments.filter(isMeetingChatAttachment) : []
		};
	} catch {
		return {
			text: content,
			attachments: []
		};
	}
}
function getMeetingChatAuthorLabel(message) {
	const displayName = message.from?.name?.trim();
	if (displayName) return displayName;
	const identity = message.from?.identity?.trim();
	if (identity) return identity;
	return "Participant";
}
function getMeetingChatParticipantAvatarUrl(message) {
	const photoURL = parseMeetingChatParticipantMetadata(message.from?.metadata)?.photoURL;
	return typeof photoURL === "string" && photoURL.trim().length > 0 ? photoURL.trim() : null;
}
function getMeetingChatAvatarUrlFromMetadata(metadata) {
	const photoURL = parseMeetingChatParticipantMetadata(metadata)?.photoURL;
	return typeof photoURL === "string" && photoURL.trim().length > 0 ? photoURL.trim() : null;
}
function detectMeetingChatMentionState(currentValue, caretPosition) {
	if (caretPosition <= 0) return DEFAULT_MEETING_CHAT_MENTION_STATE;
	const start = Math.max(0, caretPosition - MENTION_TRIGGER_LOOKBACK);
	for (let index = caretPosition - 1; index >= start; index -= 1) {
		const char = currentValue[index];
		if (char === "@") {
			if (!isMeetingChatMentionBoundary(index > 0 ? currentValue[index - 1] : void 0)) break;
			const query = currentValue.slice(index + 1, caretPosition);
			if (query.includes(" ") || query.includes("\n") || query.includes("[") || query.includes("]")) break;
			return {
				active: true,
				startIndex: index,
				query
			};
		}
		if (char === "\n" || char === " " || char === "	") break;
	}
	return DEFAULT_MEETING_CHAT_MENTION_STATE;
}
function insertMeetingChatMention(input) {
	const label = input.mentionLabel.trim();
	if (!input.mentionState.active || input.mentionState.startIndex < 0 || !label) return {
		nextValue: input.currentValue,
		nextCaret: input.caretPosition
	};
	const safeCaret = Math.max(input.mentionState.startIndex, input.caretPosition);
	const beforeMention = input.currentValue.slice(0, input.mentionState.startIndex);
	const afterMention = input.currentValue.slice(safeCaret);
	const insertion = `${`@[${label}]`}${afterMention.length === 0 || !/^[\s,.!?;:)\]}]/.test(afterMention) ? " " : ""}`;
	return {
		nextValue: `${beforeMention}${insertion}${afterMention}`,
		nextCaret: beforeMention.length + insertion.length
	};
}
function countUnreadMeetingChatMessages(messages, lastReadAt) {
	if (!Number.isFinite(lastReadAt) || lastReadAt <= 0) return messages.length;
	return messages.filter((message) => message.timestamp > lastReadAt).length;
}
function getMeetingChatInitials(label) {
	return label.split(" ").flatMap((segment) => segment ? [segment[0]] : []).join("").slice(0, 2).toUpperCase() || "P";
}
function formatMessageTime(timestamp) {
	return new Date(timestamp).toLocaleTimeString(void 0, {
		hour: "numeric",
		minute: "2-digit"
	});
}
function PendingAttachmentPill({ attachment, onRemoveAttachment }) {
	const handleRemoveAttachment = () => {
		onRemoveAttachment(attachment.id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex max-w-full items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "size-3.5 shrink-0" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "max-w-[10rem] truncate",
				children: attachment.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted-foreground",
				children: attachment.sizeLabel
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "rounded-full p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground",
				onClick: handleRemoveAttachment,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "sr-only",
					children: ["Remove ", attachment.name]
				})]
			})
		]
	}, attachment.id);
}
function MentionResultButton({ candidate, isActive, onMentionMouseDown, onSelectMention }) {
	const handleSelectMention = () => {
		onSelectMention(candidate);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onMouseDown: onMentionMouseDown,
		onClick: handleSelectMention,
		className: cn("flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition", isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
				className: "size-8 shrink-0 border border-border/60",
				children: [candidate.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
					src: candidate.avatarUrl,
					alt: candidate.label
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
					className: "bg-muted text-[11px] font-semibold text-foreground",
					children: getMeetingChatInitials(candidate.label)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1 truncate",
				children: candidate.label
			}),
			!candidate.isLocal ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-[11px] text-muted-foreground",
				children: ["@", candidate.identity]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[11px] text-muted-foreground",
				children: "You"
			})
		]
	});
}
function MeetingChatAttachmentCard({ attachment, isLocal }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-2xl p-0.5", isLocal ? "bg-primary-foreground/5" : "bg-transparent"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatMediaGallery, {
			compact: true,
			attachments: [{
				name: attachment.name,
				url: attachment.url,
				type: attachment.type,
				size: attachment.size
			}]
		})
	});
}
function MeetingChatMessageItem({ mentionLabels, localAvatarUrl, message }) {
	const authorLabel = getMeetingChatAuthorLabel(message);
	const isLocal = message.from?.isLocal ?? false;
	const avatarUrl = getMeetingChatParticipantAvatarUrl(message) ?? (isLocal ? localAvatarUrl ?? null : null);
	const content = parseMeetingChatMessageContent(message.message);
	const showAvatarOnLeft = !isLocal;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex gap-3", isLocal && "justify-end"),
		children: [
			showAvatarOnLeft ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
				className: "size-8 shrink-0 border border-border/80",
				children: [avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
					src: avatarUrl,
					alt: authorLabel
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
					className: "bg-muted text-[11px] font-semibold text-foreground",
					children: getMeetingChatInitials(authorLabel)
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("max-w-[88%] space-y-1", isLocal && "items-end text-right"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("space-y-2 rounded-2xl border px-3 py-2 shadow-sm", isLocal ? "border-accent/30 bg-primary text-primary-foreground" : "border-border/80 bg-background/95 text-foreground"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("mb-1 flex items-center gap-2 text-[11px] font-medium", isLocal ? "justify-end text-primary-foreground/80" : "text-muted-foreground"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: authorLabel }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatMessageTime(message.timestamp) })
							]
						}),
						content.text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentMentionText, {
							text: content.text,
							mentionLabels,
							className: cn("whitespace-pre-wrap text-sm leading-6", isLocal ? "text-primary-foreground" : "text-foreground"),
							mentionClassName: cn(isLocal ? "bg-primary-foreground/15 text-primary-foreground ring-primary-foreground/20" : "bg-accent/15 text-primary ring-primary/20")
						}) : null,
						content.attachments.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: content.attachments.map((attachment) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingChatAttachmentCard, {
								attachment,
								isLocal
							}, `${attachment.url}-${attachment.name}`))
						}) : null
					]
				})
			}),
			isLocal ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
				className: "size-8 shrink-0 border border-accent/25",
				children: [avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
					src: avatarUrl,
					alt: authorLabel
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
					className: "bg-accent/15 text-[11px] font-semibold text-primary",
					children: getMeetingChatInitials(authorLabel)
				})]
			}) : null
		]
	});
}
function MeetingChatLauncherButton({ unreadCount, onOpen }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		size: "sm",
		variant: "secondary",
		className: "border border-border/60 bg-card text-foreground shadow-sm backdrop-blur hover:bg-muted/40",
		onClick: onOpen,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquareText, { className: "mr-2 size-4" }),
			"Meeting chat",
			unreadCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "secondary",
				className: "ml-2 rounded-full border border-border/60 bg-muted/30 text-foreground",
				children: unreadCount
			}) : null
		]
	});
}
function MeetingChatFloatingDock({ compact, isOpen, onOpen, panelProps, unreadCount }) {
	if (compact) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none fixed inset-x-4 bottom-[max(5.5rem,env(safe-area-inset-bottom))] z-40 flex justify-end md:hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-auto",
			children: [!isOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingChatLauncherButton, {
				unreadCount,
				onOpen
			}) : null, isOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-x-3 bottom-[max(5rem,env(safe-area-inset-bottom))] z-50 max-h-[min(70dvh,24rem)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingChatPanel, { ...panelProps })
			}) : null]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute inset-x-3 bottom-3 z-30 flex justify-end max-md:bottom-[max(0.75rem,env(safe-area-inset-bottom))]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-auto flex w-full max-w-[22rem] flex-col items-end gap-2",
			children: [!isOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingChatLauncherButton, {
				unreadCount,
				onOpen
			}) : null, isOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingChatPanel, { ...panelProps }) : null]
		})
	});
}
function MeetingChatPanel({ attachmentAccept, canSend, chatMessages, draft, fileInputRef, highlightedMentionIndex, isSending, localAvatarUrl, maxAttachments, mentionLabels, mentionResults, messageEndRef, onAttachmentSelection, onClose, onComposerBlur, onDraftChange, onKeyDown, onMentionMouseDown, onRemoveAttachment, onSelectMention, onSend, pendingAttachments, showMentionResults, textareaRef, uploadingFiles }) {
	const handleAttachFiles = () => {
		fileInputRef.current?.click();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-[24rem] w-full flex-col overflow-hidden rounded-[28px] border border-border/60 bg-card text-foreground shadow-2xl backdrop-blur-xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3 border-b border-border/60 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.28em] text-muted-foreground",
					children: "Meeting chat"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-foreground",
					children: "Only people currently in the room receive these messages."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					size: "icon",
					variant: "ghost",
					className: "size-8 text-muted-foreground hover:bg-muted/40 hover:text-foreground",
					onClick: onClose,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "sr-only",
						children: "Close meeting chat"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "min-h-0 flex-1 px-4 py-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 pr-3",
					children: [chatMessages.length > 0 ? chatMessages.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingChatMessageItem, {
						mentionLabels,
						localAvatarUrl,
						message
					}, message.id ?? message.timestamp)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-2xl border border-dashed border-border/60 bg-muted/30 px-4 py-5 text-sm text-muted-foreground",
						children: "No messages yet. Say hello to everyone in the room."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: messageEndRef })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-border/60 px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileInputRef,
						type: "file",
						multiple: true,
						accept: attachmentAccept,
						"aria-label": "Attach files to meeting chat",
						className: "hidden",
						onChange: onAttachmentSelection
					}),
					pendingAttachments.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-3 flex flex-wrap gap-2",
						children: pendingAttachments.map((attachment) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PendingAttachmentPill, {
							attachment,
							onRemoveAttachment
						}, attachment.id))
					}) : null,
					showMentionResults && mentionResults.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 overflow-hidden rounded-2xl border border-border/60 bg-popover/95 shadow-lg backdrop-blur",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "border-b border-border/60 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground",
							children: "Mention someone in the room"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "max-h-52 overflow-y-auto p-2",
							children: mentionResults.map((candidate, index) => {
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MentionResultButton, {
									candidate,
									isActive: index === highlightedMentionIndex,
									onMentionMouseDown,
									onSelectMention
								}, candidate.id);
							})
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						ref: textareaRef,
						value: draft,
						onBlur: onComposerBlur,
						onChange: onDraftChange,
						onKeyDown,
						placeholder: "Send a message to everyone in the room… Type @ to mention someone.",
						autoGrow: true,
						rows: 2,
						className: "min-h-[76px] border-border/60 bg-background/95 text-foreground placeholder:text-muted-foreground hover:border-border/80 focus-visible:border-ring focus-visible:ring-ring/20"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-muted-foreground",
								children: "Press Enter to send. Shift+Enter adds a new line."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] text-muted-foreground",
								children: [
									"Type @ to mention people in the room. Share up to ",
									maxAttachments,
									" files per message."
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								size: "icon",
								variant: "ghost",
								className: "size-9 border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground",
								disabled: uploadingFiles,
								onClick: handleAttachFiles,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "sr-only",
									children: "Attach files to meeting chat"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								size: "sm",
								className: "min-w-[110px] bg-primary text-primary-foreground hover:bg-accent/90",
								disabled: !canSend || isSending || uploadingFiles,
								onClick: onSend,
								children: [isSending || uploadingFiles ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "mr-2 size-4" }), uploadingFiles ? "Uploading…" : isSending ? "Sending…" : "Send"]
							})]
						})]
					})
				]
			})
		]
	});
}
function createInitialMeetingChatState() {
	return {
		isOpen: false,
		draft: "",
		lastReadAt: 0,
		highlightedMentionIndex: 0,
		mentionState: DEFAULT_MEETING_CHAT_MENTION_STATE,
		pendingAttachments: [],
		uploadingFiles: false
	};
}
function meetingChatReducer(state, action) {
	switch (action.type) {
		case "open": return {
			...state,
			isOpen: true,
			lastReadAt: action.latestTimestamp > 0 ? action.latestTimestamp : state.lastReadAt,
			mentionState: DEFAULT_MEETING_CHAT_MENTION_STATE,
			highlightedMentionIndex: 0
		};
		case "close": return {
			...state,
			isOpen: false,
			lastReadAt: action.latestTimestamp > 0 ? action.latestTimestamp : state.lastReadAt,
			mentionState: DEFAULT_MEETING_CHAT_MENTION_STATE,
			highlightedMentionIndex: 0
		};
		case "setDraft": return {
			...state,
			draft: action.value
		};
		case "syncMentionState": return {
			...state,
			mentionState: action.value,
			highlightedMentionIndex: 0
		};
		case "resetMentionState": return {
			...state,
			mentionState: DEFAULT_MEETING_CHAT_MENTION_STATE,
			highlightedMentionIndex: 0
		};
		case "setHighlightedMentionIndex": return {
			...state,
			highlightedMentionIndex: typeof action.value === "function" ? action.value(state.highlightedMentionIndex) : action.value
		};
		case "addAttachments": return {
			...state,
			pendingAttachments: [...state.pendingAttachments, ...action.attachments]
		};
		case "removeAttachment": return {
			...state,
			pendingAttachments: state.pendingAttachments.filter((attachment) => attachment.id !== action.attachmentId)
		};
		case "clearComposer": return {
			...state,
			draft: "",
			pendingAttachments: [],
			mentionState: DEFAULT_MEETING_CHAT_MENTION_STATE,
			highlightedMentionIndex: 0
		};
		case "setUploadingFiles": return {
			...state,
			uploadingFiles: action.value
		};
		default: return action;
	}
}
function useInSiteMeetingRoomChat(props) {
	const { compact = false } = props;
	const { user } = useAuth();
	const convex = useConvex();
	const { chatMessages, send, isSending } = rn();
	const participants = Xt();
	const generateUploadUrl = useMutation(filesApi.generateUploadUrl);
	const syncMetadata = useMutation(filesApi.syncMetadata);
	const [chatState, dispatch] = (0, import_react.useReducer)(meetingChatReducer, void 0, createInitialMeetingChatState);
	const { isOpen, draft, lastReadAt, highlightedMentionIndex, mentionState, pendingAttachments, uploadingFiles } = chatState;
	const fileInputRef = (0, import_react.useRef)(null);
	const messageEndRef = (0, import_react.useRef)(null);
	const textareaRef = (0, import_react.useRef)(null);
	const trimmedDraft = draft.trim();
	const canSend = trimmedDraft.length > 0 || pendingAttachments.length > 0;
	const unreadCount = isOpen ? 0 : countUnreadMeetingChatMessages(chatMessages, lastReadAt);
	const attachmentAccept = ".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.zip,.md";
	const mentionCandidates = (() => {
		const byLabel = /* @__PURE__ */ new Map();
		for (const participant of participants) {
			const label = participant.name?.trim() || participant.identity?.trim();
			if (!label) continue;
			const key = label.toLowerCase();
			if (!byLabel.has(key)) byLabel.set(key, {
				avatarUrl: getMeetingChatAvatarUrlFromMetadata(participant.metadata),
				id: participant.sid,
				identity: participant.identity,
				isLocal: participant.isLocal,
				label
			});
		}
		return Array.from(byLabel.values()).sort((left, right) => {
			if (left.isLocal !== right.isLocal) return left.isLocal ? 1 : -1;
			return left.label.localeCompare(right.label);
		});
	})();
	const mentionLabels = mentionCandidates.map((candidate) => candidate.label);
	const mentionResults = (() => {
		if (!mentionState.active) return [];
		const normalizedQuery = mentionState.query.trim().toLowerCase();
		if (!normalizedQuery) return mentionCandidates.slice(0, 8);
		return mentionCandidates.filter((candidate) => {
			const label = candidate.label.toLowerCase();
			const identity = candidate.identity.toLowerCase();
			return label.includes(normalizedQuery) || identity.includes(normalizedQuery);
		}).slice(0, 8);
	})();
	const resetMentionState = () => {
		dispatch({ type: "resetMentionState" });
	};
	const syncMentionStateFromValue = (nextValue, caretPosition) => {
		dispatch({
			type: "syncMentionState",
			value: detectMeetingChatMentionState(nextValue, caretPosition)
		});
	};
	(0, import_react.useEffect)(() => {
		if (!isOpen || chatMessages.length === 0) return;
		messageEndRef.current?.scrollIntoView({ block: "end" });
	}, [chatMessages, isOpen]);
	const handleOpen = () => {
		dispatch({
			type: "open",
			latestTimestamp: chatMessages[chatMessages.length - 1]?.timestamp ?? 0
		});
	};
	const handleClose = () => {
		dispatch({
			type: "close",
			latestTimestamp: chatMessages[chatMessages.length - 1]?.timestamp ?? 0
		});
	};
	const handleRemoveAttachment = (attachmentId) => {
		dispatch({
			type: "removeAttachment",
			attachmentId
		});
	};
	const handleAttachmentSelection = (event) => {
		const files = event.target.files;
		if (!files || files.length === 0) return;
		const result = validateAttachments(files, pendingAttachments.length, 5);
		if (result.errors.length > 0) notifyFailure({
			title: "Some files couldn't be attached",
			message: result.errors.join(". ")
		});
		if (result.valid.length > 0) dispatch({
			type: "addAttachments",
			attachments: result.valid
		});
		event.target.value = "";
	};
	const uploadPendingMeetingAttachments = async (attachments) => {
		if (!user?.id) throw new Error("Sign in required to share files in meeting chat.");
		return Promise.all(attachments.map(async (attachment) => {
			const { url } = await uploadStorageFileWithPublicUrl({
				file: attachment.file,
				contentType: attachment.mimeType || "application/octet-stream",
				generateUploadUrl: () => generateUploadUrl({}),
				syncMetadata: (args) => syncMetadata(args),
				getPublicUrl: (args) => {
					const workspaceId = user?.agencyId;
					if (!workspaceId) throw new Error("Workspace context missing");
					return convex.query(filesApi.getPublicUrl, {
						workspaceId,
						storageId: args.storageId
					});
				}
			});
			return {
				name: attachment.name,
				size: attachment.sizeLabel,
				type: attachment.mimeType || "application/octet-stream",
				url
			};
		}));
	};
	const handleSend = async () => {
		if (!canSend) return;
		const hasAttachments = pendingAttachments.length > 0;
		if (hasAttachments) dispatch({
			type: "setUploadingFiles",
			value: true
		});
		try {
			let messageContent = trimmedDraft;
			if (hasAttachments) messageContent = buildMeetingChatMessageContent({
				attachments: await uploadPendingMeetingAttachments(pendingAttachments),
				text: trimmedDraft
			});
			await send(messageContent);
			dispatch({ type: "clearComposer" });
		} catch (error) {
			reportConvexFailure({
				error,
				context: "InSiteMeetingRoomChat:sendMessage",
				title: "Message failed",
				fallbackMessage: "Unable to send message."
			});
			if (hasAttachments) dispatch({
				type: "setUploadingFiles",
				value: false
			});
			return;
		}
		if (hasAttachments) dispatch({
			type: "setUploadingFiles",
			value: false
		});
	};
	const insertSelectedMention = (candidate) => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		const { nextCaret, nextValue } = insertMeetingChatMention({
			caretPosition: textarea.selectionStart ?? draft.length,
			currentValue: draft,
			mentionLabel: candidate.label,
			mentionState
		});
		dispatch({
			type: "setDraft",
			value: nextValue
		});
		resetMentionState();
		requestAnimationFrame(() => {
			textarea.focus();
			textarea.setSelectionRange(nextCaret, nextCaret);
		});
	};
	const handleDraftChange = (event) => {
		const nextValue = event.target.value;
		const caretPosition = event.target.selectionStart ?? nextValue.length;
		dispatch({
			type: "setDraft",
			value: nextValue
		});
		syncMentionStateFromValue(nextValue, caretPosition);
	};
	const handleComposerBlur = () => {
		resetMentionState();
	};
	const handleMentionMouseDown = (event) => {
		event.preventDefault();
	};
	const handleComposerKeyDown = (event) => {
		if (mentionState.active && mentionResults.length > 0) {
			if (event.key === "ArrowDown") {
				event.preventDefault();
				dispatch({
					type: "setHighlightedMentionIndex",
					value: (current) => (current + 1) % mentionResults.length
				});
				return;
			}
			if (event.key === "ArrowUp") {
				event.preventDefault();
				dispatch({
					type: "setHighlightedMentionIndex",
					value: (current) => (current - 1 + mentionResults.length) % mentionResults.length
				});
				return;
			}
			if (event.key === "Enter" || event.key === "Tab") {
				event.preventDefault();
				const candidate = mentionResults[highlightedMentionIndex] ?? mentionResults[0];
				if (candidate) insertSelectedMention(candidate);
				return;
			}
			if (event.key === "Escape") {
				event.preventDefault();
				resetMentionState();
				return;
			}
		}
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			handleSend();
		}
	};
	const handleSendMessage = () => {
		handleSend();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingChatFloatingDock, {
		compact,
		isOpen,
		onOpen: handleOpen,
		panelProps: {
			attachmentAccept,
			canSend,
			chatMessages,
			draft,
			fileInputRef,
			highlightedMentionIndex,
			isSending,
			localAvatarUrl: user?.photoURL ?? null,
			maxAttachments: 5,
			mentionLabels,
			mentionResults,
			messageEndRef,
			onAttachmentSelection: handleAttachmentSelection,
			onClose: handleClose,
			onComposerBlur: handleComposerBlur,
			onDraftChange: handleDraftChange,
			onKeyDown: handleComposerKeyDown,
			onMentionMouseDown: handleMentionMouseDown,
			onRemoveAttachment: handleRemoveAttachment,
			onSelectMention: insertSelectedMention,
			onSend: handleSendMessage,
			pendingAttachments,
			showMentionResults: mentionState.active,
			textareaRef,
			uploadingFiles
		},
		unreadCount
	});
}
function InSiteMeetingRoomChat(props) {
	return useInSiteMeetingRoomChat(props);
}
var MEETING_CONTROL_BAR_CONTROLS = {
	chat: false,
	settings: true
};
function LiveRoomCanvasHeader({ captureLabel, compact, isSupported, meetingTitle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 backdrop-blur", compact ? "px-3 py-2.5" : "px-4 py-3"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs uppercase tracking-[0.28em] text-muted-foreground",
			children: "Live room"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("mt-1 font-medium text-foreground", compact ? "text-xs" : "text-sm"),
			children: meetingTitle
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				variant: captureLabel === "Recording live" ? "secondary" : "outline",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3" }), captureLabel]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: isSupported ? "secondary" : "outline",
				children: isSupported ? "Browser mic ready" : "Browser mic unavailable"
			})]
		})]
	});
}
function LiveRoomCanvasOverlay({ aiStatusLabel, autoSyncing, canMinimize, captureLabel, compactBadgeTextColor, finalizingSession, isMinimized, notesProcessingState, onToggleMinimize, onTogglePictureInPicture, pipActive, pipSupported, transcriptProcessingState, useDarkChrome }) {
	const chromeClassName = useDarkChrome ? "border-border/60 bg-card/90 text-card-foreground hover:bg-card" : "border border-border/60 bg-background/95";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-x-3 top-3 z-20 flex flex-wrap items-start justify-between gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("pointer-events-auto inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur", useDarkChrome ? "border-warning/20 bg-warning/10 text-warning-foreground" : "border-warning/20 bg-warning/10 text-warning-foreground"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2.5 animate-pulse rounded-full bg-warning ring-4 ring-warning/20" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: compactBadgeTextColor,
					children: captureLabel
				})]
			}), useDarkChrome ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/90 px-3 py-1.5 text-xs font-medium text-card-foreground shadow-sm backdrop-blur",
				children: [autoSyncing || notesProcessingState === "processing" || finalizingSession || transcriptProcessingState === "processing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5 text-info" }), aiStatusLabel]
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-auto flex gap-2",
			children: [pipSupported ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				size: "sm",
				variant: "secondary",
				className: chromeClassName,
				onClick: onTogglePictureInPicture,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PictureInPicture2, { className: "mr-2 size-3.5" }), pipActive ? "Exit PiP" : "Enter PiP"]
			}) : null, canMinimize ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				size: "sm",
				variant: "secondary",
				className: cn(chromeClassName, "md:hidden"),
				onClick: onToggleMinimize,
				children: [isMinimized ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "mr-2 size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize2, { className: "mr-2 size-3.5" }), isMinimized ? "Restore room" : "Send to tray"]
			}) : null]
		})]
	});
}
function LiveRoomCanvasEmptyState({ compact }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("relative flex h-full items-center justify-center rounded-[26px] border border-dashed border-border bg-muted/20 px-6 text-center", compact ? "min-h-[150px]" : "min-h-[420px]"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-foreground",
				children: "Camera tiles will appear here once someone joins with video."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "You can still start the room, use audio-only mode, and capture transcript data for AI notes."
			})]
		})
	});
}
function LiveRoomCanvasViewport({ aiStatusLabel, autoSyncing, canMinimize, captureLabel, compact, finalizingSession, isMinimized, notesProcessingState, onToggleMinimize, onTogglePictureInPicture, pipActive, pipSupported, recordingPrompt, showRecordingPrompt = false, tracks, transcriptProcessingState }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("min-h-0 flex-1 bg-background", compact ? "p-2.5" : "p-3 lg:p-4"),
		children: tracks.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative h-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveRoomCanvasOverlay, {
					aiStatusLabel,
					autoSyncing,
					canMinimize,
					captureLabel,
					finalizingSession,
					isMinimized,
					notesProcessingState,
					onToggleMinimize,
					onTogglePictureInPicture,
					pipActive,
					pipSupported,
					transcriptProcessingState,
					useDarkChrome: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(livekit_exports.GridLayout, {
					tracks,
					className: cn("h-full rounded-[26px] border border-border/80 bg-muted/20 p-2", compact ? "min-h-[150px]" : "min-h-[420px]"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(livekit_exports.ParticipantTile, {})
				}),
				showRecordingPrompt && recordingPrompt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-auto absolute inset-x-3 bottom-3 z-30 max-w-xl",
					children: recordingPrompt
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InSiteMeetingRoomChat, { compact })
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative h-full",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveRoomCanvasOverlay, {
					aiStatusLabel,
					autoSyncing,
					canMinimize,
					captureLabel,
					compactBadgeTextColor: "",
					finalizingSession,
					isMinimized,
					notesProcessingState,
					onToggleMinimize,
					onTogglePictureInPicture,
					pipActive,
					pipSupported,
					transcriptProcessingState,
					useDarkChrome: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveRoomCanvasEmptyState, { compact }),
				showRecordingPrompt && recordingPrompt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-auto absolute inset-x-3 bottom-3 z-30 max-w-xl",
					children: recordingPrompt
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InSiteMeetingRoomChat, { compact })
			]
		})
	});
}
function LiveRoomCanvasShell({ aiStatusLabel, captureLabel, children, compact, isSupported, layoutContext, meetingTitle, roomViewportRef, shouldUseAssertiveLiveRegion }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(livekit_exports.LayoutContextProvider, {
		value: layoutContext,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: roomViewportRef,
			className: cn("meeting-room-livekit-theme flex flex-col overflow-hidden border border-border bg-card shadow-sm", compact ? "min-h-[220px] rounded-[28px]" : "min-h-[560px] rounded-[32px]"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "sr-only",
					"aria-live": shouldUseAssertiveLiveRegion ? "assertive" : "polite",
					children: `Recording state: ${captureLabel}. Automation state: ${aiStatusLabel}.`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveRoomCanvasHeader, {
					captureLabel,
					compact,
					isSupported,
					meetingTitle
				}),
				children,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("border-t border-border bg-card/95 backdrop-blur", compact ? "p-2.5" : "p-3"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(livekit_exports.ControlBar, { controls: MEETING_CONTROL_BAR_CONTROLS })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(livekit_exports.RoomAudioRenderer, {})
			]
		})
	});
}
function shouldRetryAutoCapture(error) {
	if (!error) return true;
	const normalized = error.toLowerCase();
	return !(normalized.includes("denied") || normalized.includes("not supported") || normalized.includes("no microphone") || normalized.includes("service not available"));
}
function InSiteMeetingLiveRoomCanvas(props) {
	const { meetingTitle, layoutContext, autoCaptureEnabled, onEnableTranscriptRecording, transcriptRecordingEnabled, compact = false, pipSupported, pipActive, canMinimize, isMinimized, autoSyncing, finalizingSession, transcriptProcessingState, notesProcessingState, notesProcessingError, transcriptProcessingError, summaryPreview, onTogglePictureInPicture, onToggleMinimize, roomViewportRef, onAppendTranscript, onInterimTranscriptChange, onCaptureStatusChange } = props;
	const tracks = rr([{
		source: Track.Source.Camera,
		withPlaceholder: true
	}, {
		source: Track.Source.ScreenShare,
		withPlaceholder: false
	}], { onlySubscribed: false });
	const { isSupported, isListening, startListening, stopListening, transcript, error } = useVoiceInput({
		continuous: true,
		silenceTimeout: 12,
		maxDuration: 55,
		onResult: onAppendTranscript
	});
	const trimmedTranscript = transcript.trim();
	(0, import_react.useLayoutEffect)(() => {
		if (!onCaptureStatusChange) return;
		onCaptureStatusChange({
			supported: isSupported,
			listening: isListening,
			error
		});
	}, [
		error,
		isListening,
		isSupported,
		onCaptureStatusChange
	]);
	(0, import_react.useLayoutEffect)(() => {
		if (!onInterimTranscriptChange) return;
		onInterimTranscriptChange(autoCaptureEnabled ? trimmedTranscript : "");
	}, [
		autoCaptureEnabled,
		onInterimTranscriptChange,
		trimmedTranscript
	]);
	(0, import_react.useEffect)(() => {
		if (!autoCaptureEnabled) {
			if (isListening) stopListening();
			return;
		}
		if (!isSupported || isListening || !shouldRetryAutoCapture(error)) return;
		const timeoutId = window.setTimeout(() => {
			startListening();
		}, 900);
		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [
		autoCaptureEnabled,
		error,
		isListening,
		isSupported,
		startListening,
		stopListening
	]);
	(0, import_react.useEffect)(() => {
		return () => {
			stopListening();
		};
	}, [stopListening]);
	const captureLabel = isListening ? "Recording live" : transcriptRecordingEnabled ? "Capture armed" : "Recording paused";
	const aiStatusLabel = autoSyncing || notesProcessingState === "processing" ? "AI notes syncing" : finalizingSession || transcriptProcessingState === "processing" ? "Finalizing transcript" : notesProcessingError || transcriptProcessingError ? "Automation needs attention" : summaryPreview ? "AI summary ready" : "Listening for transcript";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveRoomCanvasShell, {
		aiStatusLabel,
		captureLabel,
		compact,
		isSupported,
		layoutContext,
		meetingTitle,
		roomViewportRef,
		shouldUseAssertiveLiveRegion: Boolean(notesProcessingError || transcriptProcessingError),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveRoomCanvasViewport, {
			aiStatusLabel,
			autoSyncing,
			canMinimize,
			captureLabel,
			compact,
			finalizingSession,
			isMinimized,
			notesProcessingState,
			onToggleMinimize,
			onTogglePictureInPicture,
			pipActive,
			pipSupported,
			recordingPrompt: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingRecordingPromptCard, {
				canRecord: true,
				captureError: error,
				captureSupported: isSupported,
				compact: true,
				inRoom: true,
				recordingEnabled: transcriptRecordingEnabled,
				onEnableRecording: onEnableTranscriptRecording
			}),
			showRecordingPrompt: !transcriptRecordingEnabled,
			tracks,
			transcriptProcessingState
		})
	});
}
function MeetingRoomPageHeader({ joinConfigPresent, onBack }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-start justify-between gap-4 rounded-[28px] border border-border bg-card px-5 py-4 shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.32em] text-muted-foreground",
				children: "Meetings"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight text-foreground",
					children: "Meeting room"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Native LiveKit room inside Cohorts with automatic transcript capture and Google Calendar scheduling."
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			variant: "outline",
			onClick: onBack,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "mr-2 size-4" }), joinConfigPresent ? "Leave room" : "Back to meetings"]
		})]
	});
}
function MeetingRoomHeroSection({ meetingStatus, meetingTitle, meetingDescription, meetingStartTimeMs, meetingEndTimeMs, meetingTimezone, joinConfigPresent, isMobileViewport, pipSupported, pipActive, canMinimizeRoom, isMinimized, meetingLink, onOpenSidebar, onTogglePictureInPicture, onToggleMinimize, onCopyLink }) {
	const roomModeMessage = isMinimized ? "Mobile tray is active. Restore the full room whenever you want to return to the main call view." : pipActive ? "Picture in Picture is active so the call can stay visible while you browse the workspace." : joinConfigPresent && !pipSupported ? "This browser keeps the room embedded in Cohorts because Picture in Picture is unavailable here." : canMinimizeRoom ? "Minimize the room into the mobile tray to keep the call pinned while you review notes." : joinConfigPresent ? "The room is live in Cohorts. Picture in Picture and the mobile tray are available when supported." : "Join the room to unlock PiP and mobile tray controls.";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-start justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "mr-1 size-3" }), formatLocalDateTime(meetingStartTimeMs, meetingTimezone)]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "mr-1 size-3" }),
								"Ends ",
								formatLocalDateTime(meetingEndTimeMs, meetingTimezone)
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							children: meetingStatus.replace("_", " ")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: joinConfigPresent ? "secondary" : "outline",
							children: joinConfigPresent ? "Room live" : "Waiting to join"
						}),
						joinConfigPresent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: pipActive ? "secondary" : "outline",
							children: pipActive ? "PiP active" : pipSupported ? "PiP available" : "PiP unavailable"
						}) : null,
						joinConfigPresent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: isMinimized ? "secondary" : "outline",
							children: isMinimized ? "Mobile tray active" : isMobileViewport ? "Mobile tray available" : "Mobile tray on mobile"
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-3xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.32em] text-muted-foreground",
						children: "Cohorts room"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 text-3xl font-semibold tracking-tight lg:text-[2.75rem]",
						children: meetingTitle
					})]
				}),
				meetingDescription ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-2xl text-sm leading-6 text-muted-foreground",
					children: meetingDescription
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-2xl text-sm text-muted-foreground",
					children: roomModeMessage
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full flex-col gap-2 sm:w-auto sm:items-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						onClick: onOpenSidebar,
						children: "Room sidebar"
					}),
					joinConfigPresent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						onClick: onTogglePictureInPicture,
						disabled: !pipSupported,
						title: pipSupported ? void 0 : "Picture in Picture is unavailable in this browser",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PictureInPicture2, { className: "mr-2 size-4" }), pipActive ? "Exit PiP" : pipSupported ? "Enter PiP" : "PiP unavailable"]
					}) : null,
					joinConfigPresent && canMinimizeRoom ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						className: "md:hidden",
						onClick: onToggleMinimize,
						children: [isMinimized ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "mr-2 size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize2, { className: "mr-2 size-4" }), isMinimized ? "Restore room" : "Send to tray"]
					}) : null,
					meetingLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						className: "min-w-[152px]",
						onClick: onCopyLink,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "mr-2 size-4" }), "Copy link"]
					}) : null
				]
			}), joinConfigPresent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground sm:max-w-xs sm:text-right",
				children: isMinimized ? "The call is pinned to the bottom tray and will keep running while you review meeting details." : pipActive ? "Picture in Picture is active. Use the browser mini-player or Exit PiP to return to the full room view." : !pipSupported ? "Picture in Picture is unavailable in this browser, so the call will remain embedded inside Cohorts." : canMinimizeRoom ? "On mobile, you can send the room to the tray without leaving the call." : "Use PiP or the room sidebar to keep the meeting visible while you multitask."
			}) : null]
		})]
	});
}
function MeetingRoomEmptyState({ inlineJoinError, hasJoinReference }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-[420px] items-center justify-center rounded-[32px] border border-border bg-card p-6 shadow-sm lg:min-h-[560px] lg:p-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-3xl space-y-6 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto flex size-16 items-center justify-center rounded-3xl border border-accent/20 bg-accent/10 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-7" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.35em] text-muted-foreground",
							children: "Native meeting workspace"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mx-auto max-w-3xl text-3xl font-semibold tracking-tight lg:text-5xl",
							children: "Run the call here, keep notes in sync automatically."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto max-w-2xl text-sm leading-7 text-muted-foreground lg:text-base",
							children: "This room is backed by LiveKit for in-site audio and video, while Google Workspace continues to handle the calendar invite and reminders."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 text-left md:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-border bg-muted/30 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-[0.28em] text-muted-foreground",
								children: "Call surface"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-foreground",
								children: "Join without leaving Cohorts and keep the meeting context visible."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-border bg-muted/30 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-[0.28em] text-muted-foreground",
								children: "Auto transcript"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-foreground",
								children: "Start recording when the call begins. Cohorts transcribes speech, then generates guarded Gemini notes after enough context is captured."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-border bg-muted/30 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-[0.28em] text-muted-foreground",
								children: "PiP + mobile tray"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-foreground",
								children: "Pop the room into Picture in Picture or pin it into a minimized mobile tray without dropping the call."
							})]
						})
					]
				}),
				inlineJoinError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
					className: "border-destructive/40 bg-destructive/5 text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: hasJoinReference ? "Unable to join the room" : "Room unavailable" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: inlineJoinError })
					]
				}) : null
			]
		})
	});
}
function MeetingRoomCanvasSection({ autoCaptureEnabled, onEnableTranscriptRecording, transcriptRecordingEnabled, autoSyncing, canMinimize, finalizingSession, hasJoinReference, inlineJoinError, isMinimized, joinConfig, joinError, layoutContext, meetingTitle, notesProcessingError, notesProcessingState, onAppendTranscript, onCaptureStatusChange, onDisconnected, onError, onInterimTranscriptChange, onToggleMinimize, onTogglePictureInPicture, pipActive, pipSupported, roomPinnedToMobileTray, roomViewportRef, summaryPreview, transcriptProcessingError, transcriptProcessingState }) {
	const handleLiveKitError = (error) => {
		onError(error.message);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative", roomPinnedToMobileTray ? "min-h-[168px]" : "min-h-[420px]"),
		children: [joinConfig ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [roomPinnedToMobileTray ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-[28px] border border-dashed border-border bg-muted/20 p-5 shadow-sm md:hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.3em] text-muted-foreground",
							children: "Room minimized"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-lg font-semibold tracking-tight text-foreground",
							children: "The call is still running in Cohorts."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								children: "Mobile tray active"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: pipActive ? "secondary" : "outline",
								children: pipActive ? "PiP active" : pipSupported ? "PiP available" : "PiP unavailable"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-6 text-muted-foreground",
							children: "Keep browsing the meeting details while the room stays pinned to the bottom of the screen. Restore the room anytime without dropping the call."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					size: "sm",
					variant: "outline",
					onClick: onToggleMinimize,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "mr-2 size-4" }), "Restore"]
				})]
			})
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(livekit_exports.LiveKitRoom, {
			token: joinConfig.token,
			serverUrl: joinConfig.serverUrl,
			connect: true,
			audio: true,
			video: true,
			onDisconnected,
			onError: handleLiveKitError,
			className: cn(roomPinnedToMobileTray ? "fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 mx-auto w-auto max-w-[calc(100vw-2rem)] md:hidden" : "h-full"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InSiteMeetingLiveRoomCanvas, {
				meetingTitle,
				layoutContext,
				autoCaptureEnabled,
				onEnableTranscriptRecording,
				transcriptRecordingEnabled,
				compact: roomPinnedToMobileTray,
				pipSupported,
				pipActive,
				canMinimize,
				isMinimized,
				autoSyncing,
				finalizingSession,
				transcriptProcessingState,
				notesProcessingState,
				notesProcessingError,
				transcriptProcessingError,
				summaryPreview,
				onTogglePictureInPicture,
				onToggleMinimize,
				roomViewportRef,
				onAppendTranscript,
				onInterimTranscriptChange,
				onCaptureStatusChange
			})
		})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingRoomEmptyState, {
			inlineJoinError,
			hasJoinReference
		}), joinConfig && joinError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
			className: "border-destructive/40 bg-destructive/5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-4" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Room connection warning" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: joinError })
			]
		}) : null]
	});
}
function MeetingRoomToolsSection({ captureErrorPresent, captureListening, finalizingSession, hasTranscriptSaved, roomAutomationMessage, roomAutomationBadge, lastAutoSyncAt, summaryReady, transcriptProcessingState, notesProcessingState, meetingTimezone, joinConfigPresent, viewport, join, roomActionLabel, onOpenSidebar, onToggleMinimize, onJoinRoom }) {
	const { mobile: isMobileViewport, minimized: isMinimized, pipSupported, pipActive } = viewport;
	const { joining: joiningRoom, preview: isPreviewMeeting, hasReference: hasJoinReference } = join;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-start justify-between gap-3 rounded-3xl border border-border bg-card p-4 shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.28em] text-muted-foreground",
				children: "Room tools"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-foreground",
				children: roomAutomationMessage
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sr-only",
				"aria-live": "polite",
				children: `Meeting status: ${roomAutomationBadge}. ${roomAutomationMessage}`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: roomAutomationBadge
					}),
					joinConfigPresent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: pipActive ? "secondary" : "outline",
						children: pipActive ? "PiP active" : pipSupported ? "PiP available" : "PiP unavailable"
					}) : null,
					joinConfigPresent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: isMinimized ? "secondary" : "outline",
						children: isMinimized ? "Mobile tray active" : isMobileViewport ? "Mobile tray available" : "Mobile tray on mobile"
					}) : null,
					lastAutoSyncAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						children: ["Last sync ", formatLocalDateTime(lastAutoSyncAt, meetingTimezone)]
					}) : null,
					transcriptProcessingState === "processing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "info",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 size-3 animate-spin" }), "Finalizing transcript"]
					}) : null,
					notesProcessingState === "processing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "info",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 size-3 animate-spin" }), "Generating AI notes"]
					}) : null
				]
			}),
			joinConfigPresent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-2xl text-xs text-muted-foreground",
				children: isMinimized ? "The mobile tray is active. Expand the room anytime to return to the full call layout." : pipActive ? "Picture in Picture is active and the call can stay visible while you move around the dashboard." : !pipSupported ? "Picture in Picture is unavailable in this browser, so the room stays embedded inside Cohorts." : isMobileViewport ? "This phone-sized view supports both PiP and the mobile tray while the room is live." : "PiP is ready when supported, and the mobile tray appears automatically on small screens."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingAutomationPipeline, {
				className: "mt-3",
				captureErrorPresent,
				captureListening,
				finalizingSession,
				hasTranscriptSaved,
				inRoom: joinConfigPresent,
				notesProcessingState,
				summaryReady,
				transcriptProcessingState
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					onClick: onOpenSidebar,
					children: "Open sidebar"
				}),
				joinConfigPresent && isMobileViewport ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					className: "md:hidden",
					onClick: onToggleMinimize,
					children: [isMinimized ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "mr-2 size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize2, { className: "mr-2 size-4" }), isMinimized ? "Restore room" : "Send to tray"]
				}) : null,
				!joinConfigPresent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					className: cn(getButtonClasses("primary"), "min-w-[168px]"),
					disabled: joiningRoom || isPreviewMeeting || !hasJoinReference,
					onClick: onJoinRoom,
					children: [joiningRoom ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "mr-2 size-4" }), roomActionLabel]
				}) : null
			]
		})]
	});
}
function MeetingRoomLeaveDialog({ open, onOpenChange, onConfirm }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Leave and finalize this meeting?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "This exits the room and starts transcript finalization plus AI notes generation immediately." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Stay in room" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
			onClick: onConfirm,
			children: "Leave and finalize"
		})] })] })
	});
}
/**
* Normalize arbitrary text into a filesystem-safe slug segment.
*/
function slugify(value, options = {}) {
	const maxLength = options.maxLength ?? 48;
	const fallback = options.fallback ?? "item";
	const base = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, maxLength);
	return base.length > 0 ? base : fallback;
}
function slugifyMeetingTitle(title) {
	return slugify(title, {
		maxLength: 48,
		fallback: "meeting"
	});
}
function buildMeetingArtifactFilename(title, kind) {
	const slug = slugifyMeetingTitle(title);
	if (kind === "notes-pdf") return `${slug}-notes.pdf`;
	return `${slug}-${kind}.md`;
}
function downloadPdfArtifact(blob, filename) {
	if (typeof document === "undefined") return;
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.rel = "noopener";
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.setTimeout(() => {
		URL.revokeObjectURL(url);
	}, 0);
}
function downloadTextArtifact(content, filename) {
	if (typeof document === "undefined") return;
	const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.rel = "noopener";
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.setTimeout(() => {
		URL.revokeObjectURL(url);
	}, 0);
}
async function downloadUrlArtifact(url, filename) {
	const response = await fetch(url);
	if (!response.ok) throw new Error("Unable to download the archived meeting file.");
	const blob = await response.blob();
	const objectUrl = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = objectUrl;
	link.download = filename;
	link.rel = "noopener";
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.setTimeout(() => {
		URL.revokeObjectURL(objectUrl);
	}, 0);
}
var PAGE_MARGIN_PT = 54;
var HEADING_FONT_SIZE = 13;
var BODY_FONT_SIZE = 11;
var TITLE_FONT_SIZE = 16;
var HEADING_LINE_HEIGHT = 16;
var BODY_LINE_HEIGHT = 14;
var SECTION_GAP = 8;
function parseMeetingNotesMarkdown(content) {
	const normalized = normalizeNotesSummary(stripMarkdownFence(content));
	if (!normalized) return [];
	const blocks = [];
	for (const line of normalized.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed) continue;
		if (trimmed.startsWith("## ")) {
			blocks.push({
				type: "heading",
				text: trimmed.slice(3).trim()
			});
			continue;
		}
		if (trimmed.startsWith("# ")) {
			blocks.push({
				type: "heading",
				text: trimmed.slice(2).trim()
			});
			continue;
		}
		const bulletText = trimmed.match(/^[-*]\s+(.+)$/)?.[1]?.trim();
		if (bulletText) {
			blocks.push({
				type: "bullet",
				text: bulletText
			});
			continue;
		}
		blocks.push({
			type: "paragraph",
			text: trimmed
		});
	}
	return blocks;
}
function renderMeetingNotesPdf({ meetingTitle, content }) {
	const doc = new import_jspdf_node_min.jsPDF({
		unit: "pt",
		format: "letter"
	});
	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();
	const maxWidth = pageWidth - PAGE_MARGIN_PT * 2;
	let y = PAGE_MARGIN_PT;
	const ensureSpace = (height) => {
		if (y + height > pageHeight - PAGE_MARGIN_PT) {
			doc.addPage();
			y = PAGE_MARGIN_PT;
		}
	};
	const writeLines = (lines, x, lineHeight) => {
		for (const line of lines) {
			ensureSpace(lineHeight);
			doc.text(line, x, y);
			y += lineHeight;
		}
	};
	doc.setFont("helvetica", "bold");
	doc.setFontSize(TITLE_FONT_SIZE);
	writeLines(doc.splitTextToSize(meetingTitle.trim() || "Meeting notes", maxWidth), PAGE_MARGIN_PT, 18);
	y += SECTION_GAP;
	doc.setDrawColor(200);
	doc.line(PAGE_MARGIN_PT, y, pageWidth - PAGE_MARGIN_PT, y);
	y += SECTION_GAP;
	const blocks = parseMeetingNotesMarkdown(content);
	if (blocks.length === 0) {
		doc.setFont("helvetica", "normal");
		doc.setFontSize(BODY_FONT_SIZE);
		writeLines(["No meeting notes content."], PAGE_MARGIN_PT, BODY_LINE_HEIGHT);
		return doc;
	}
	for (const block of blocks) {
		if (block.type === "heading") {
			y += 4;
			doc.setFont("helvetica", "bold");
			doc.setFontSize(HEADING_FONT_SIZE);
			writeLines(doc.splitTextToSize(block.text, maxWidth), PAGE_MARGIN_PT, HEADING_LINE_HEIGHT);
			y += 2;
			continue;
		}
		doc.setFont("helvetica", "normal");
		doc.setFontSize(BODY_FONT_SIZE);
		if (block.type === "bullet") {
			const lines = doc.splitTextToSize(block.text, maxWidth - 14);
			for (const line of lines) {
				ensureSpace(BODY_LINE_HEIGHT);
				doc.text(line === lines[0] ? `• ${line}` : `  ${line}`, 60, y);
				y += BODY_LINE_HEIGHT;
			}
			continue;
		}
		writeLines(doc.splitTextToSize(block.text, maxWidth), PAGE_MARGIN_PT, BODY_LINE_HEIGHT);
	}
	return doc;
}
function buildMeetingNotesPdfArrayBuffer(options) {
	return renderMeetingNotesPdf(options).output("arraybuffer");
}
function buildMeetingNotesPdfBlob(options) {
	return new Blob([buildMeetingNotesPdfArrayBuffer(options)], { type: "application/pdf" });
}
function MeetingArtifactsDownload({ className, legacyId, meetingTitle, notesSummary, notesStorageId, transcriptText, transcriptStorageId, compact = false }) {
	const { user } = useAuth();
	const workspaceId = getWorkspaceId(user);
	const [downloading, setDownloading] = (0, import_react.useState)(null);
	const artifactUrls = useQuery(meetingArchivesApi.getArtifactDownloadUrls, workspaceId ? {
		workspaceId,
		legacyId
	} : "skip");
	const hasNotes = Boolean(notesSummary?.trim());
	const hasTranscript = Boolean(transcriptText?.trim());
	const notesArchived = Boolean(notesStorageId) || Boolean(artifactUrls?.notesArchived);
	const transcriptArchived = Boolean(transcriptStorageId) || Boolean(artifactUrls?.transcriptArchived);
	const handleDownloadNotesPdf = () => {
		const content = notesSummary?.trim();
		if (!content) return;
		setDownloading("notes-pdf");
		try {
			downloadPdfArtifact(buildMeetingNotesPdfBlob({
				meetingTitle,
				content
			}), buildMeetingArtifactFilename(meetingTitle, "notes-pdf"));
		} catch (error) {
			reportConvexFailure({
				error,
				context: "MeetingArtifactsDownload:notesPdf",
				title: "PDF download failed",
				fallbackMessage: "Unable to download meeting notes as PDF."
			});
		}
		setDownloading(null);
	};
	const handleDownloadTranscript = () => {
		const content = transcriptText?.trim();
		if (!content) return;
		setDownloading("transcript");
		try {
			downloadTextArtifact(content, buildMeetingArtifactFilename(meetingTitle, "transcript"));
		} catch {}
		setDownloading(null);
	};
	const handleDownloadNotesFromCloud = async () => {
		setDownloading("notes-cloud");
		try {
			const url = artifactUrls?.notesDownloadUrl;
			if (!url) {
				setDownloading(null);
				reportConvexFailure({
					error: /* @__PURE__ */ new Error("url missing"),
					context: "MeetingArtifactsDownload:notesCloudUrl",
					title: "Not ready yet",
					fallbackMessage: "Meeting notes are still syncing to cloud storage. Try again in a moment."
				});
				return;
			}
			await downloadUrlArtifact(url, buildMeetingArtifactFilename(meetingTitle, "notes-pdf"));
		} catch (error) {
			reportConvexFailure({
				error,
				context: "MeetingArtifactsDownload:notesCloud",
				title: "Cloud notes download failed",
				fallbackMessage: "Unable to download archived meeting notes."
			});
		}
		setDownloading(null);
	};
	const handleDownloadTranscriptFromCloud = async () => {
		setDownloading("transcript-cloud");
		try {
			const url = artifactUrls?.transcriptDownloadUrl;
			if (!url) {
				setDownloading(null);
				reportConvexFailure({
					error: /* @__PURE__ */ new Error("url missing"),
					context: "MeetingArtifactsDownload:transcriptCloudUrl",
					title: "Not ready yet",
					fallbackMessage: "Meeting transcript is still syncing to cloud storage. Try again in a moment."
				});
				return;
			}
			await downloadUrlArtifact(url, buildMeetingArtifactFilename(meetingTitle, "transcript"));
		} catch (error) {
			reportConvexFailure({
				error,
				context: "MeetingArtifactsDownload:transcriptCloud",
				title: "Cloud transcript download failed",
				fallbackMessage: "Unable to download archived meeting transcript."
			});
		}
		setDownloading(null);
	};
	const handleNotesCloudClick = () => {
		handleDownloadNotesFromCloud();
	};
	const handleTranscriptCloudClick = () => {
		handleDownloadTranscriptFromCloud();
	};
	if (!hasNotes && !hasTranscript) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-wrap gap-2", className),
		children: [hasNotes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			size: compact ? "sm" : "default",
			variant: "outline",
			onClick: handleDownloadNotesPdf,
			disabled: downloading !== null,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), downloading === "notes-pdf" ? "Downloading…" : "Download PDF"]
		}), workspaceId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			size: compact ? "sm" : "default",
			variant: "ghost",
			onClick: handleNotesCloudClick,
			disabled: downloading !== null || !notesArchived,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudDownload, { className: "size-4" }), downloading === "notes-cloud" ? "Fetching…" : notesArchived ? "Cloud copy" : "Cloud syncing…"]
		}) : null] }) : null, hasTranscript ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			size: compact ? "sm" : "default",
			variant: "outline",
			onClick: handleDownloadTranscript,
			disabled: downloading !== null,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), downloading === "transcript" ? "Downloading…" : "Download transcript"]
		}), workspaceId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			size: compact ? "sm" : "default",
			variant: "ghost",
			onClick: handleTranscriptCloudClick,
			disabled: downloading !== null || !transcriptArchived,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudDownload, { className: "size-4" }), downloading === "transcript-cloud" ? "Fetching…" : transcriptArchived ? "Cloud copy" : "Cloud syncing…"]
		}) : null] }) : null]
	});
}
var meetingNotesMarkdownComponents = {
	h2: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		className: "mt-4 text-sm font-semibold tracking-tight text-foreground first:mt-0",
		children
	}),
	ul: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-2 list-disc space-y-1.5 pl-5 text-sm text-foreground",
		children
	}),
	li: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
		className: "leading-relaxed",
		children
	}),
	p: ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 text-sm leading-relaxed text-foreground",
		children
	})
};
function MeetingNotesMarkdown({ content, className }) {
	const normalized = stripMarkdownFence(content);
	if (!normalized) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("prose-meeting-notes", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, {
			components: meetingNotesMarkdownComponents,
			children: normalized
		})
	});
}
function MeetingOperationsSheetHeader({ joinConfig, meetingRoomName }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, {
		className: "border-b border-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Room sidebar" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: "Capture state, attendees, automation, and AI notes for this room." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					children: meetingRoomName
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: joinConfig ? "secondary" : "outline",
					children: joinConfig ? "Room live" : "Waiting to join"
				})]
			})
		]
	});
}
function MeetingOperationsCaptureCard({ canRecord, captureStatus, joinConfig, onEnableRecording, recordingEnabled, transcriptSource }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingRecordingPromptCard, {
			canRecord,
			captureError: captureStatus.error,
			captureSupported: captureStatus.supported,
			inRoom: Boolean(joinConfig),
			recordingEnabled,
			onEnableRecording
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border/80 bg-card p-4 shadow-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.28em] text-muted-foreground",
					children: "Capture status"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: joinConfig ? "secondary" : "outline",
							children: joinConfig ? "In room" : "Ready to join"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: recordingEnabled ? "secondary" : "outline",
							children: recordingEnabled ? "Recording armed" : "Recording paused"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: captureStatus.listening ? "secondary" : "outline",
							children: captureStatus.listening ? "Listening" : "Not listening"
						}),
						transcriptSource ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							children: transcriptSource
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: captureStatus.supported ? recordingEnabled ? "Speech is transcribed locally, synced to the meeting record, and used for guarded Gemini notes." : "Start recording when the meeting begins so transcript capture and AI notes can run." : "Browser speech capture is unavailable in this browser. Transcript sync will stay idle until capture is available."
				})
			]
		})]
	});
}
function MeetingOperationsAttendeesCard({ meetingAttendeeEmails }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border/80 bg-card p-4 shadow-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.28em] text-muted-foreground",
				children: "People invited"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center gap-2 text-sm font-medium text-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4 text-muted-foreground" }),
					meetingAttendeeEmails.length,
					" attendee",
					meetingAttendeeEmails.length === 1 ? "" : "s"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: meetingAttendeeEmails.length > 0 ? meetingAttendeeEmails.slice(0, 8).map((email) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					className: "max-w-full break-all whitespace-normal text-left",
					children: email
				}, email)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No attendees listed on this meeting yet."
				})
			})
		]
	});
}
function MeetingOperationsAutomationCard({ autoSyncing, finalizingSession, joinConfig, markCompleted, notesProcessingState, retryingPostCallProcessing, transcriptProcessingState }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border/80 bg-card p-4 shadow-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.28em] text-muted-foreground",
				children: "Automation"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-foreground",
				children: retryingPostCallProcessing || finalizingSession || transcriptProcessingState === "processing" || notesProcessingState === "processing" ? "The meeting has ended. Final transcript and AI notes are being wrapped up now. Keep this page open while post-call processing finishes." : "Capture and meeting summary stay in the background while the room is running."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: joinConfig ? "secondary" : "outline",
						children: joinConfig ? "Room live" : "Waiting to join"
					}),
					autoSyncing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: "Syncing now"
					}) : null,
					retryingPostCallProcessing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "info",
						children: "Retrying post-call"
					}) : null,
					transcriptProcessingState === "processing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "info",
						children: "Transcript finalizing"
					}) : null,
					notesProcessingState === "processing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "info",
						children: "AI notes generating"
					}) : null,
					markCompleted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: "Marked completed"
					}) : null
				]
			})
		]
	});
}
function MeetingOperationsSyncCards({ notesModel, summaryStatus, transcriptLength, transcriptProcessingState, transcriptSource, transcriptStatus, transcriptTruncatedForNotes }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3 sm:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border/70 bg-card p-3 shadow-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.24em] text-muted-foreground",
					children: "Speech sync"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-foreground",
					children: transcriptStatus
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							children: [transcriptLength, " chars"]
						}),
						transcriptSource ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							children: transcriptSource
						}) : null,
						transcriptProcessingState === "processing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "info",
							children: "Finalizing"
						}) : null
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border/70 bg-card p-3 shadow-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.24em] text-muted-foreground",
					children: "Summary sync"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-foreground",
					children: summaryStatus
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [notesModel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: notesModel
					}) : null, transcriptTruncatedForNotes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: "Transcript truncated"
					}) : null]
				})
			]
		})]
	});
}
function MeetingOperationsAlerts({ captureError, notesProcessingError, notesReason, canGenerateNotes, canRetryPostCallProcessing, generatingNotes, retryingPostCallProcessing, onGenerateNotes, onRetryPostCallProcessing, transcriptProcessingError }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		captureError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Capture warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: captureError })] }) : null,
		transcriptProcessingError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
			className: "border-destructive/40 bg-destructive/5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Transcript finalization failed" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: transcriptProcessingError }), canRetryPostCallProcessing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "outline",
					onClick: onRetryPostCallProcessing,
					disabled: retryingPostCallProcessing,
					children: retryingPostCallProcessing ? "Retrying post-call…" : "Retry post-call processing"
				}) : null]
			})]
		}) : null,
		notesReason === "generation_failed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
			className: "border-destructive/40 bg-destructive/5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "AI summary failed" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The last notes generation request failed. Try again after a little more transcript is captured." }), canGenerateNotes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "outline",
					onClick: onGenerateNotes,
					disabled: generatingNotes,
					children: generatingNotes ? "Retrying AI notes…" : "Retry AI notes"
				}) : null]
			})]
		}) : null,
		notesProcessingError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
			className: "border-destructive/40 bg-destructive/5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "AI notes generation failed" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: notesProcessingError }), canGenerateNotes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "outline",
					onClick: onGenerateNotes,
					disabled: generatingNotes,
					children: generatingNotes ? "Retrying AI notes…" : "Retry AI notes"
				}) : null]
			})]
		}) : null,
		notesReason === "ai_not_configured" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "AI summary unavailable" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: "Gemini is not configured for meeting notes in this environment." })] }) : null
	] });
}
function MeetingOperationsSummaryCard({ canGenerateNotes, generatingNotes, legacyId, meetingTitle, notesProcessingState, notesStorageId, onGenerateNotes, postCallProcessingActive, summaryPreview, transcriptLength, transcriptStorageId, transcriptText }) {
	if (notesProcessingState === "processing" && !summaryPreview) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FadeIn, {
		y: 12,
		className: "rounded-2xl border border-border/80 bg-card p-4 shadow-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.28em] text-muted-foreground",
				children: "AI summary"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-foreground",
				children: "Gemini is generating structured meeting notes from the saved transcript. This usually takes a few seconds."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: "Notes include Summary, Decisions, Action Items, and Risks / Blockers with factual guardrails applied."
			})
		]
	});
	if (summaryPreview) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FadeIn, {
		y: 12,
		className: "rounded-2xl border border-border/80 bg-card p-4 shadow-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.28em] text-muted-foreground",
					children: "Latest AI summary"
				}), canGenerateNotes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "outline",
					className: cn(pressableScaleClass),
					onClick: onGenerateNotes,
					disabled: generatingNotes || notesProcessingState === "processing",
					children: generatingNotes || notesProcessingState === "processing" ? "Refreshing…" : "Refresh summary"
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingNotesMarkdown, {
				className: "mt-3",
				content: summaryPreview
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingArtifactsDownload, {
				className: "mt-4",
				compact: true,
				legacyId,
				meetingTitle,
				notesStorageId,
				notesSummary: summaryPreview,
				transcriptStorageId,
				transcriptText
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, {
		y: 12,
		className: "rounded-2xl border border-border/80 bg-card p-4 shadow-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.28em] text-muted-foreground",
					children: "AI summary"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-foreground",
					children: notesProcessingState === "processing" ? "The meeting ended and AI notes generation is already running." : transcriptLength >= 20 ? "Generate a meeting summary now, or let it generate automatically when the room ends." : "Speak for a bit first so the transcript has enough content for AI notes."
				}),
				postCallProcessingActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: "Post-call processing is running. Keep this page open until transcript finalization and notes generation finish."
				}) : null
			] }), canGenerateNotes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "sm",
				variant: "outline",
				className: cn(pressableScaleClass),
				onClick: onGenerateNotes,
				disabled: generatingNotes || notesProcessingState === "processing",
				children: generatingNotes || notesProcessingState === "processing" ? "Generating..." : "Generate notes"
			}) : null]
		})
	});
}
function MeetingOperationsLiveCapturePreview({ interimTranscript }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-muted/30 p-3 text-xs text-foreground",
		children: ["Live capture: ", interimTranscript]
	});
}
function formatSyncLabel(timestamp, timezone, emptyLabel) {
	if (!timestamp) return emptyLabel;
	return `Updated ${formatLocalDateTime(timestamp, timezone)}`;
}
function InSiteMeetingOperationsSheet(props) {
	const { open, onOpenChange, canRecord, joinConfig, captureStatus, onEnableRecording, recordingEnabled, meetingAttendeeEmails, meetingRoomName, meetingTimezone, transcriptSource, transcriptSavedAt, transcriptProcessingState, transcriptProcessingError, notesUpdatedAt, notesModel, notesProcessingState, notesProcessingError, markCompleted, autoSyncing, finalizingSession, interimTranscript, summaryPreview, notesReason, notesStorageId, transcriptStorageId, transcriptTruncatedForNotes, transcriptLength, meetingLegacyId, meetingTitle, transcriptText, canGenerateNotes, generatingNotes, onGenerateNotes, retryingPostCallProcessing, canRetryPostCallProcessing, onRetryPostCallProcessing } = props;
	const transcriptStatus = transcriptProcessingState === "processing" ? "Finalizing transcript now" : transcriptProcessingState === "failed" ? "Transcript finalization needs attention" : formatSyncLabel(transcriptSavedAt, meetingTimezone, "Waiting for first capture sync");
	const summaryStatus = notesProcessingState === "processing" || generatingNotes ? "Generating summary now" : notesProcessingState === "failed" ? "AI notes generation needs attention" : notesReason === "ai_not_configured" ? "AI note generation is unavailable in this environment" : notesReason === "generation_failed" ? "Last summary generation attempt failed" : formatSyncLabel(notesUpdatedAt, meetingTimezone, "Waiting for transcript before summary");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			side: "right",
			className: "w-full gap-0 p-0 sm:max-w-[440px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingOperationsSheetHeader, {
				joinConfig,
				meetingRoomName
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-h-0 flex-1 space-y-4 overflow-y-auto p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingOperationsCaptureCard, {
						canRecord,
						captureStatus,
						joinConfig,
						onEnableRecording,
						recordingEnabled,
						transcriptSource
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingOperationsAttendeesCard, { meetingAttendeeEmails }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingOperationsAutomationCard, {
						autoSyncing,
						finalizingSession,
						joinConfig,
						markCompleted,
						notesProcessingState,
						retryingPostCallProcessing,
						transcriptProcessingState
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingAutomationPipeline, {
						captureErrorPresent: Boolean(captureStatus.error),
						captureListening: captureStatus.listening,
						finalizingSession,
						hasTranscriptSaved: Boolean(transcriptSavedAt),
						inRoom: Boolean(joinConfig),
						notesProcessingState,
						recordingEnabled,
						summaryReady: Boolean(summaryPreview),
						transcriptProcessingState
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingOperationsSyncCards, {
						notesModel,
						summaryStatus,
						transcriptLength,
						transcriptProcessingState,
						transcriptSource,
						transcriptStatus,
						transcriptTruncatedForNotes
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingOperationsAlerts, {
						captureError: captureStatus.error,
						notesProcessingError,
						notesReason,
						canGenerateNotes,
						canRetryPostCallProcessing,
						generatingNotes,
						retryingPostCallProcessing,
						onGenerateNotes,
						onRetryPostCallProcessing,
						transcriptProcessingError
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingOperationsSummaryCard, {
						canGenerateNotes,
						generatingNotes,
						legacyId: meetingLegacyId,
						meetingTitle,
						notesProcessingState,
						notesStorageId,
						onGenerateNotes,
						postCallProcessingActive: retryingPostCallProcessing || finalizingSession || transcriptProcessingState === "processing" || notesProcessingState === "processing",
						summaryPreview,
						transcriptLength,
						transcriptStorageId,
						transcriptText
					}),
					interimTranscript ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingOperationsLiveCapturePreview, { interimTranscript }) : null
				]
			})]
		})
	});
}
function MeetingRoomPage(props) {
	const { meeting, onClose, canRecord = true } = props;
	const [leaveDialogOpen, setLeaveDialogOpen] = (0, import_react.useState)(false);
	const { liveRoomLayoutContext, appendTranscriptSnippet, interimTranscript, setInterimTranscript, markCompleted, transcriptSavedAt, transcriptSource, transcriptProcessingState, transcriptProcessingError, notesUpdatedAt, notesModel, summaryPreview, notesProcessingState, notesProcessingError, notesReason, notesStorageId, transcriptStorageId, transcriptTruncatedForNotes, operationsOpen, setJoinError, generatingNotes, finalizingSession, retryingPostCallProcessing, joinConfig, setJoinConfig, joiningRoom, joinError, autoCaptureEnabled, transcriptRecordingEnabled, enableTranscriptRecording, captureStatus, setCaptureStatus, autoSyncing, lastAutoSyncAt, meetingStatus, meetingTimezone, meetingDescription, meetingLink, meetingRoomName, meetingTitle, meetingAttendeeEmails, isPreviewMeeting, hasJoinReference, inlineJoinError, roomActionLabel, normalizedTranscript, canPersist, canGenerateNotes, hasTranscriptPendingSync, roomPinnedToMobileTray, canMinimizeRoom, isMinimized, isMobileViewport, pipSupported, pipActive, setRoomViewportElement, togglePictureInPicture, toggleMinimizedRoom, handleJoinRoom, finalizeMeetingAfterRoomExit, handleGenerateNotes, handleRetryPostCallProcessing, handleOperationsOpenChange } = useInSiteMeetingRoomController(props);
	const roomAutomationMessage = autoSyncing || notesProcessingState === "processing" ? "Transcript is synced and AI notes are regenerating in the background." : finalizingSession || transcriptProcessingState === "processing" ? "The call is wrapping up and the final transcript package is being processed." : notesProcessingError || transcriptProcessingError ? "Room automation needs attention. Open the sidebar for the latest processing error." : hasTranscriptPendingSync ? "New transcript lines are queued and will sync shortly." : summaryPreview ? "Transcript capture and AI notes are in sync." : normalizedTranscript.length >= 20 ? "Transcript capture is active. AI notes will generate automatically as the room continues." : "Join the room, start transcript recording, then Cohorts will save speech and generate guarded AI notes.";
	const roomAutomationBadge = autoSyncing || notesProcessingState === "processing" ? "AI notes syncing" : finalizingSession || transcriptProcessingState === "processing" ? "Finalizing transcript" : notesProcessingError || transcriptProcessingError ? "Attention needed" : hasTranscriptPendingSync ? "Pending sync" : summaryPreview ? "Summary ready" : "Listening";
	const handleOpenSidebar = () => {
		handleOperationsOpenChange(true);
	};
	const handleCopyLink = async () => {
		if (typeof navigator === "undefined" || !meetingLink) return;
		try {
			await navigator.clipboard.writeText(meetingLink);
			notifySuccess({
				title: "Room link copied",
				message: "Share the Cohorts room URL with attendees who need direct access."
			});
		} catch {
			notifyFailure({
				title: "Copy failed",
				message: "Clipboard access is unavailable. Copy the room URL manually from the address bar."
			});
		}
	};
	const handleDisconnected = () => {
		setJoinConfig(null);
		setInterimTranscript("");
		finalizeMeetingAfterRoomExit(false);
	};
	const handleBack = () => {
		if (joinConfig) {
			setLeaveDialogOpen(true);
			return;
		}
		onClose();
	};
	const handleConfirmLeave = () => {
		setLeaveDialogOpen(false);
		finalizeMeetingAfterRoomExit(true);
	};
	const toolsViewport = {
		mobile: isMobileViewport,
		minimized: isMinimized,
		pipSupported,
		pipActive
	};
	const toolsJoin = {
		joining: joiningRoom,
		preview: isPreviewMeeting,
		hasReference: hasJoinReference
	};
	const meetingShell = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5 p-5 lg:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingRoomHeroSection, {
				meetingStatus,
				meetingTitle,
				meetingDescription,
				meetingStartTimeMs: meeting.startTimeMs,
				meetingEndTimeMs: meeting.endTimeMs,
				meetingTimezone,
				joinConfigPresent: Boolean(joinConfig),
				isMobileViewport,
				pipSupported,
				pipActive,
				canMinimizeRoom,
				isMinimized,
				meetingLink,
				onOpenSidebar: handleOpenSidebar,
				onTogglePictureInPicture: togglePictureInPicture,
				onToggleMinimize: toggleMinimizedRoom,
				onCopyLink: handleCopyLink
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingRoomCanvasSection, {
				autoCaptureEnabled: autoCaptureEnabled && canPersist,
				onEnableTranscriptRecording: enableTranscriptRecording,
				transcriptRecordingEnabled,
				autoSyncing,
				canMinimize: canMinimizeRoom,
				finalizingSession,
				hasJoinReference,
				inlineJoinError,
				isMinimized,
				joinConfig,
				joinError,
				layoutContext: liveRoomLayoutContext,
				meetingTitle,
				notesProcessingError,
				notesProcessingState,
				onAppendTranscript: appendTranscriptSnippet,
				onCaptureStatusChange: setCaptureStatus,
				onDisconnected: handleDisconnected,
				onError: setJoinError,
				onInterimTranscriptChange: setInterimTranscript,
				onToggleMinimize: toggleMinimizedRoom,
				onTogglePictureInPicture: togglePictureInPicture,
				pipActive,
				pipSupported,
				roomPinnedToMobileTray,
				roomViewportRef: setRoomViewportElement,
				summaryPreview,
				transcriptProcessingError,
				transcriptProcessingState
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingRoomToolsSection, {
				captureErrorPresent: Boolean(captureStatus.error),
				captureListening: captureStatus.listening,
				finalizingSession,
				hasTranscriptSaved: Boolean(transcriptSavedAt),
				roomAutomationMessage,
				roomAutomationBadge,
				lastAutoSyncAt,
				summaryReady: Boolean(summaryPreview),
				transcriptProcessingState,
				notesProcessingState,
				meetingTimezone,
				joinConfigPresent: Boolean(joinConfig),
				viewport: toolsViewport,
				join: toolsJoin,
				roomActionLabel,
				onOpenSidebar: handleOpenSidebar,
				onToggleMinimize: toggleMinimizedRoom,
				onJoinRoom: handleJoinRoom
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InSiteMeetingOperationsSheet, {
		open: operationsOpen,
		onOpenChange: handleOperationsOpenChange,
		canRecord,
		meetingLegacyId: meeting.legacyId,
		meetingTitle,
		joinConfig,
		captureStatus,
		onEnableRecording: enableTranscriptRecording,
		recordingEnabled: transcriptRecordingEnabled,
		meetingAttendeeEmails,
		meetingRoomName,
		meetingTimezone,
		transcriptSource,
		transcriptSavedAt,
		transcriptProcessingState,
		transcriptProcessingError,
		notesUpdatedAt,
		notesModel,
		notesProcessingState,
		notesProcessingError,
		markCompleted,
		autoSyncing,
		finalizingSession,
		interimTranscript,
		summaryPreview,
		notesReason,
		notesStorageId,
		transcriptStorageId,
		transcriptTruncatedForNotes,
		transcriptLength: normalizedTranscript.length,
		transcriptText: normalizedTranscript,
		canGenerateNotes,
		generatingNotes,
		onGenerateNotes: handleGenerateNotes,
		retryingPostCallProcessing,
		canRetryPostCallProcessing: canPersist && normalizedTranscript.length >= 20,
		onRetryPostCallProcessing: handleRetryPostCallProcessing
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingRoomPageHeader, {
				joinConfigPresent: Boolean(joinConfig),
				onBack: handleBack
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-hidden rounded-[32px] border border-border/80 bg-background shadow-sm",
				children: meetingShell
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingRoomLeaveDialog, {
				open: leaveDialogOpen,
				onOpenChange: setLeaveDialogOpen,
				onConfirm: handleConfirmLeave
			})
		]
	});
}
function MeetingCancelDialog(props) {
	const { meeting, cancellingMeetingId, onOpenChange, onConfirm } = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
		open: Boolean(meeting),
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Cancel meeting" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: meeting ? `Cancel "${meeting.title}" and send cancellation updates to invited attendees.` : "Cancel this meeting and notify invited attendees." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
			disabled: Boolean(cancellingMeetingId),
			children: "Keep meeting"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
			onClick: onConfirm,
			disabled: Boolean(cancellingMeetingId),
			className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			children: cancellingMeetingId ? "Cancelling…" : "Cancel meeting"
		})] })] })
	});
}
function MeetingRoomLoadingState(props) {
	const { sharedRoomName, onBack } = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-start justify-between gap-4 rounded-[28px] border border-border bg-card px-5 py-4 shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.32em] text-muted-foreground",
				children: "Meetings"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight text-foreground",
					children: "Meeting room"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						"Resolving room workspace for ",
						sharedRoomName,
						"."
					]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "outline",
			onClick: onBack,
			children: "Back to meetings"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Loading room" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: "Preparing the in-site meeting workspace." })] })] });
}
function parseTimeValue(value) {
	const match = /^(?:([01][0-9]|2[0-3])):([0-5][0-9])$/.exec(value ?? "");
	if (!match) return {
		hour24: 9,
		minute: 0
	};
	return {
		hour24: Number(match[1]),
		minute: Number(match[2])
	};
}
function to12HourParts(hour24) {
	const period = hour24 >= 12 ? "PM" : "AM";
	return {
		hour12: hour24 % 12 || 12,
		period
	};
}
function to24Hour(hour12, period) {
	const normalizedHour = hour12 % 12;
	return period === "PM" ? normalizedHour + 12 : normalizedHour;
}
function formatTimeValue(hour24, minute) {
	return `${hour24.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}
function TimePicker({ value, onChange, disabled = false, minuteStep = 15, className, id }) {
	const { hour24, minute } = parseTimeValue(value);
	const { hour12, period } = to12HourParts(hour24);
	const minuteOptions = (() => {
		const normalizedStep = Number.isFinite(minuteStep) && minuteStep > 0 ? Math.min(60, minuteStep) : 15;
		const options = /* @__PURE__ */ new Set();
		for (let currentMinute = 0; currentMinute < 60; currentMinute += normalizedStep) options.add(currentMinute);
		options.add(minute);
		return Array.from(options).toSorted((left, right) => left - right);
	})();
	const hourValue = String(hour12);
	const minuteValue = minute.toString().padStart(2, "0");
	const handleHourChange = (nextHour) => {
		onChange(formatTimeValue(to24Hour(Number(nextHour), period), minute));
	};
	const handleMinuteChange = (nextMinute) => {
		onChange(formatTimeValue(hour24, Number(nextMinute)));
	};
	const handlePeriodChange = (nextPeriod) => {
		onChange(formatTimeValue(to24Hour(hour12, nextPeriod), minute));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		id,
		className: cn("grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: hourValue,
				onValueChange: handleHourChange,
				disabled,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					"aria-label": "Hour",
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Hour" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: Array.from({ length: 12 }, (_, index) => index + 1).map((hourOption) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: String(hourOption),
					children: hourOption
				}, hourOption)) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: minuteValue,
				onValueChange: handleMinuteChange,
				disabled,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					"aria-label": "Minutes",
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Minutes" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: minuteOptions.map((minuteOption) => {
					const optionValue = minuteOption.toString().padStart(2, "0");
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: optionValue,
						children: optionValue
					}, optionValue);
				}) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: period,
				onValueChange: handlePeriodChange,
				disabled,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					"aria-label": "AM or PM",
					className: "w-[88px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "AM/PM" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: "AM",
					children: "AM"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: "PM",
					children: "PM"
				})] })]
			})
		]
	});
}
function MeetingAttendeesSelectedList({ disabled, emptyStateText, onRemoveEmail, selectedEmails }) {
	if (selectedEmails.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mb-2 px-1 text-xs text-muted-foreground",
		children: emptyStateText
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mb-2 flex flex-wrap gap-2",
		children: selectedEmails.map((email) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectedEmailBadge, {
			disabled,
			email,
			onRemoveEmail
		}, email))
	});
}
function MeetingAttendeesInputRow({ disabled, inputId, inputValue, onCommitInput, onInputChange, onInputKeyDown }) {
	const handleInputChange = (event) => onInputChange(event.target.value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			id: inputId,
			value: inputValue,
			onChange: handleInputChange,
			onKeyDown: onInputKeyDown,
			placeholder: "Type name or email and press Enter",
			disabled
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "outline",
			onClick: onCommitInput,
			disabled: disabled || inputValue.trim().length === 0,
			children: "Add"
		})]
	});
}
function attendeeInitials(name) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "?";
	const first = parts[0] ?? "";
	if (parts.length === 1) return first.slice(0, 2).toUpperCase();
	const second = parts[1] ?? "";
	return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}
function attendeeAvatarColor(email) {
	const palette = [
		"bg-blue-100 text-blue-700",
		"bg-emerald-100 text-emerald-700",
		"bg-violet-100 text-violet-700",
		"bg-amber-100 text-amber-700",
		"bg-rose-100 text-rose-700"
	];
	return palette[email.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length] ?? palette[0];
}
function MeetingAttendeesSuggestions({ disabled, label = "Suggested participants", onAddSuggestedEmail, suggestions }) {
	if (suggestions.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "-mx-1 flex gap-2 overflow-x-auto px-1 pb-1",
			children: suggestions.map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuggestedEmailButton, {
				disabled,
				member,
				onAddSuggestedEmail
			}, member.id))
		})]
	});
}
function SelectedEmailBadge({ disabled, email, onRemoveEmail }) {
	const handleRemove = () => {
		onRemoveEmail(email);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
		variant: "secondary",
		className: "gap-1 pr-1",
		children: [email, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: handleRemove,
			disabled,
			className: "rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground",
			"aria-label": `Remove ${email}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
		})]
	});
}
function SuggestedEmailButton({ disabled, member, onAddSuggestedEmail }) {
	const handleAdd = () => {
		onAddSuggestedEmail(member.email);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: handleAdd,
		disabled,
		className: "flex min-w-[9.5rem] shrink-0 items-center gap-2.5 rounded-lg border border-muted/60 bg-background px-3 py-2 text-left transition-colors hover:border-primary/30 hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-50",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${attendeeAvatarColor(member.email)}`,
			children: attendeeInitials(member.name)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-0 leading-tight",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block truncate text-sm font-medium text-foreground",
				children: member.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block truncate text-xs text-muted-foreground",
				children: member.email
			})]
		})]
	});
}
function MeetingAttendeesField({ label, inputId, inputValue, selectedEmails, disabled, emptyStateText, helperText, suggestions, suggestionsLabel, onInputChange, onInputKeyDown, onCommitInput, onRemoveEmail, onAddSuggestedEmail }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: inputId,
				className: "text-sm font-medium",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-input bg-background p-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingAttendeesSelectedList, {
					disabled,
					emptyStateText,
					onRemoveEmail,
					selectedEmails
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingAttendeesInputRow, {
					disabled,
					inputId,
					inputValue,
					onCommitInput,
					onInputChange,
					onInputKeyDown
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingAttendeesSuggestions, {
				disabled,
				label: suggestionsLabel,
				onAddSuggestedEmail,
				suggestions
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: helperText
			})
		]
	});
}
var SCHEDULE_DURATION_OPTIONS = [
	{
		value: "15",
		label: "15 minutes"
	},
	{
		value: "30",
		label: "30 minutes"
	},
	{
		value: "45",
		label: "45 minutes"
	},
	{
		value: "60",
		label: "1 hour"
	},
	{
		value: "90",
		label: "1.5 hours"
	},
	{
		value: "120",
		label: "2 hours"
	}
];
function MeetingDetailsSection({ description, descriptionId, descriptionPlaceholder, disabled, title, titleId, titlePlaceholder, onDescriptionChange, onTitleChange }) {
	const handleTitleChange = (event) => {
		onTitleChange(event.target.value);
	};
	const handleDescriptionChange = (event) => {
		onDescriptionChange(event.target.value);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2 md:col-span-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			htmlFor: titleId,
			className: "text-sm font-medium",
			children: "Title"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			id: titleId,
			required: true,
			disabled,
			value: title,
			onChange: handleTitleChange,
			placeholder: titlePlaceholder
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2 md:col-span-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			htmlFor: descriptionId,
			className: "text-sm font-medium",
			children: "Description"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
			id: descriptionId,
			rows: 3,
			disabled,
			value: description,
			onChange: handleDescriptionChange,
			placeholder: descriptionPlaceholder
		})]
	})] });
}
function MeetingScheduleDateSection({ dateId, disabled, meetingDate, onMeetingDateChange }) {
	const handleDisabledDate = (date) => date < new Date((/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			htmlFor: dateId,
			className: "text-sm font-medium",
			children: "Date"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				id: dateId,
				type: "button",
				variant: "outline",
				className: cn("w-full justify-start text-left font-normal", !meetingDate && "text-muted-foreground"),
				disabled,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "mr-2 size-4" }), meetingDate ? format(meetingDate, "PPP") : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pick a date" })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
			className: "w-auto p-0",
			align: "start",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
				mode: "single",
				selected: meetingDate,
				onSelect: onMeetingDateChange,
				disabled: handleDisabledDate,
				initialFocus: true
			})
		})] })]
	});
}
function MeetingTimingSection({ disabled, durationId, durationMinutes, durationVariant = "input", meetingTime, minuteStep = 15, showStartTime = true, timeId, timezone, timezoneId, timezoneReadOnly = false, onDurationMinutesChange, onMeetingTimeChange, onTimezoneChange }) {
	const handleDurationChange = (event) => {
		onDurationMinutesChange(event.target.value);
	};
	const handleDurationSelect = (value) => {
		onDurationMinutesChange(value);
	};
	const handleTimezoneChange = (event) => {
		onTimezoneChange(event.target.value);
	};
	const durationSelectValue = SCHEDULE_DURATION_OPTIONS.some((option) => option.value === durationMinutes) ? durationMinutes : "30";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		showStartTime && timeId && onMeetingTimeChange ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: timeId,
				className: "text-sm font-medium",
				children: "Start time"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimePicker, {
				id: timeId,
				value: meetingTime ?? "",
				onChange: onMeetingTimeChange,
				disabled,
				minuteStep
			})]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: durationId,
				className: "text-sm font-medium",
				children: "Duration"
			}), durationVariant === "select" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: durationSelectValue,
				onValueChange: handleDurationSelect,
				disabled,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					id: durationId,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select duration" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: SCHEDULE_DURATION_OPTIONS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: option.value,
					children: option.label
				}, option.value)) })]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				id: durationId,
				type: "number",
				min: minuteStep,
				step: minuteStep,
				required: true,
				disabled,
				value: durationMinutes,
				onChange: handleDurationChange
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					htmlFor: timezoneId,
					className: "text-sm font-medium",
					children: "Timezone"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: timezoneId,
					required: true,
					disabled: disabled || timezoneReadOnly,
					readOnly: timezoneReadOnly,
					value: timezone,
					onChange: handleTimezoneChange,
					placeholder: "America/New_York",
					className: timezoneReadOnly ? "bg-muted/40 text-muted-foreground" : void 0
				}),
				timezoneReadOnly ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Uses your browser timezone. Shown in the footer below."
				}) : null
			]
		})
	] });
}
function MeetingScheduleWhenSection({ dateId, disabled, durationId, durationMinutes, meetingDate, meetingTime, timeId, timezone, timezoneId, onDurationMinutesChange, onMeetingDateChange, onMeetingTimeChange, onTimezoneChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 sm:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingScheduleDateSection, {
				dateId,
				disabled,
				meetingDate,
				onMeetingDateChange
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					htmlFor: timeId,
					className: "text-sm font-medium",
					children: "Start time"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimePicker, {
					id: timeId,
					value: meetingTime,
					onChange: onMeetingTimeChange,
					disabled,
					minuteStep: 15
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingTimingSection, {
				disabled,
				durationId,
				durationMinutes,
				durationVariant: "select",
				showStartTime: false,
				timezone,
				timezoneId,
				timezoneReadOnly: true,
				onDurationMinutesChange,
				onTimezoneChange
			})
		]
	});
}
function MeetingAttendeesSection({ disabled, emptyStateText, helperText, inputId, inputValue, label, selectedEmails, suggestions, suggestionsLabel, onAddSuggestedEmail, onCommitInput, onInputChange, onInputKeyDown, onRemoveEmail }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingAttendeesField, {
		label,
		inputId,
		inputValue,
		selectedEmails,
		disabled,
		emptyStateText,
		helperText,
		suggestions,
		suggestionsLabel,
		onInputChange,
		onInputKeyDown,
		onCommitInput,
		onRemoveEmail,
		onAddSuggestedEmail
	});
}
function ScheduleFormSection({ title, description, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("rounded-lg border border-muted/50 bg-muted/15 p-4", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 space-y-0.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-semibold text-foreground",
				children: title
			}), description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground text-pretty",
				children: description
			}) : null]
		}), children]
	});
}
function MeetingScheduleCardFrame({ attendeeEmails, attendeeInput, attendeeSuggestions, cardDescription, cardTitle, description, durationMinutes, footerAction, googleWorkspaceConnected, meetingDate, meetingTime, onAddSuggestedAttendee, onAttendeeInputChange, onAttendeeKeyDown, onCommitAttendeeInput, onDescriptionChange, onDurationMinutesChange, onMeetingDateChange, onMeetingTimeChange, onRemoveAttendee, onSubmit, onTimezoneChange, onTitleChange, scheduleDisabled, scheduleRequiresGoogleWorkspace, scheduling, submitDisabled, submitLabel, submittingLabel, timezone, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: cn(DASHBOARD_THEME.cards.base, "overflow-hidden"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "space-y-3 border-b border-muted/40 bg-muted/10 pb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn(DASHBOARD_THEME.icons.container, "size-10 shrink-0 rounded-lg"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPlus, {
						className: "size-5",
						"aria-hidden": true
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1 space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base leading-tight",
						children: cardTitle
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "text-pretty",
						children: cardDescription
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "pt-5",
			children: [scheduleRequiresGoogleWorkspace && !googleWorkspaceConnected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
				className: "mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Google Workspace required" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: "Connect Google Workspace from the header to send calendar invites when you schedule a room." })]
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-5",
				onSubmit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScheduleFormSection, {
						title: "When",
						description: "Pick the date, start time, and length of the meeting.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingScheduleWhenSection, {
							disabled: scheduleDisabled,
							dateId: "schedule-date",
							meetingDate,
							timeId: "schedule-start-time",
							meetingTime,
							durationId: "schedule-duration",
							durationMinutes,
							timezone,
							timezoneId: "schedule-timezone",
							onMeetingDateChange,
							onMeetingTimeChange,
							onDurationMinutesChange,
							onTimezoneChange
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScheduleFormSection, {
						title: "Details",
						description: "Give attendees context before they join.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-4 md:grid-cols-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingDetailsSection, {
								disabled: scheduleDisabled,
								title,
								titleId: "schedule-title",
								titlePlaceholder: "Weekly client strategy sync",
								description,
								descriptionId: "schedule-description",
								descriptionPlaceholder: "Agenda, links, and expected outcomes",
								onTitleChange,
								onDescriptionChange
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScheduleFormSection, {
						title: "Participants",
						description: "Invite at least one person to create the room and calendar event.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingAttendeesSection, {
							label: "Add attendees",
							inputId: "schedule-attendees-input",
							inputValue: attendeeInput,
							selectedEmails: attendeeEmails,
							disabled: scheduleDisabled,
							emptyStateText: "No attendees added yet.",
							helperText: "Press Enter or click Add after typing an email. Suggested teammates appear below.",
							suggestionsLabel: "Suggested participants",
							suggestions: attendeeSuggestions,
							onInputChange: onAttendeeInputChange,
							onInputKeyDown: onAttendeeKeyDown,
							onCommitInput: onCommitAttendeeInput,
							onRemoveEmail: onRemoveAttendee,
							onAddSuggestedEmail: onAddSuggestedAttendee
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3 border-t border-muted/40 pt-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								className: cn(getButtonClasses("primary"), "min-w-40"),
								disabled: submitDisabled,
								children: scheduling ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), submittingLabel] }) : submitLabel
							}),
							footerAction,
							submitDisabled && !scheduling ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Add a date, time, title, and at least one attendee to schedule."
							}) : null
						]
					})
				]
			})]
		})]
	});
}
function CreateMeetingCard(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingScheduleCardFrame, {
		...props,
		cardTitle: "Schedule Meeting",
		cardDescription: "Pick a date, add attendees, and send calendar invites from one form.",
		submittingLabel: "Scheduling...",
		submitLabel: "Schedule Room"
	});
}
function RescheduleMeetingCard({ onReset, ...props }) {
	const footerAction = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		variant: "outline",
		className: getButtonClasses("outline"),
		onClick: onReset,
		disabled: props.scheduling,
		children: "Cancel Edit"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingScheduleCardFrame, {
		...props,
		cardTitle: "Reschedule Meeting",
		cardDescription: "Update time, attendees, and details. Calendar invites and room access stay in sync automatically.",
		submittingLabel: "Saving…",
		submitLabel: "Save Reschedule",
		footerAction
	});
}
function GoogleWorkspaceIcon({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SvglBrandLogo, {
		brand: "google",
		className,
		labeled: false
	});
}
function MeetingsHeader(props) {
	const { googleWorkspaceConnected, googleWorkspaceStatusLoading = false, canSchedule, quickStarting, quickMeetDisabled, onStartQuickMeet, onConnectGoogleWorkspace, onManageGoogleWorkspace } = props;
	const quickMeetDisabledReason = googleWorkspaceStatusLoading ? "Checking Google Workspace connection" : !canSchedule ? "Scheduling is unavailable in this workspace" : quickMeetDisabled ? "Connect Google Workspace to start a meeting with calendar invite support" : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardPageHero, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 flex-1 items-start gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn(DASHBOARD_THEME.icons.container, "size-11 shrink-0 rounded-xl"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, {
				className: "size-6",
				"aria-hidden": true
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1 space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: DASHBOARD_THEME.layout.title,
				children: PAGE_TITLES.meetings?.title ?? "Meetings"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn(DASHBOARD_THEME.layout.subtitle, "max-w-2xl text-pretty"),
				children: PAGE_TITLES.meetings?.description ?? "Run native meeting rooms, send Google Calendar invites, and keep AI notes synced."
			})]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center",
		children: [googleWorkspaceStatusLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			variant: "outline",
			className: cn(getButtonClasses("outline"), "w-full sm:w-auto"),
			disabled: true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Checking Workspace…"]
		}) : googleWorkspaceConnected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full flex-wrap items-center gap-2 sm:w-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "secondary",
				className: "hidden font-normal sm:inline-flex",
				children: "Connected"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "outline",
				className: cn(getButtonClasses("outline"), "w-full sm:w-auto"),
				disabled: !canSchedule,
				onClick: onManageGoogleWorkspace,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleWorkspaceIcon, { className: "mr-2 size-4" }), "Manage"]
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			variant: "outline",
			className: cn(getButtonClasses("outline"), "w-full sm:w-auto"),
			disabled: !canSchedule,
			onClick: onConnectGoogleWorkspace,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleWorkspaceIcon, { className: "mr-2 size-4" }), "Connect Google Workspace"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			className: cn(getButtonClasses("primary"), "w-full sm:w-auto"),
			disabled: !canSchedule || quickStarting || quickMeetDisabled,
			onClick: onStartQuickMeet,
			title: quickMeetDisabledReason,
			children: [quickStarting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "mr-2 size-4" }), googleWorkspaceStatusLoading ? "Checking…" : "Quick Meet"]
		})]
	})] });
}
function QuickMeetDialogHeader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Start Cohorts Room" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Launch a native in-site meeting room immediately and send optional Google Calendar invites to attendees." })] });
}
function QuickMeetDialogForm({ attendeeEmails, attendeeInput, attendeeSuggestions, description, durationMinutes, onAddSuggestedAttendee, onAttendeeInputChange, onAttendeeKeyDown, onCancel, onCommitAttendeeInput, onDescriptionChange, onDurationMinutesChange, onRemoveAttendee, onSubmit, onTimezoneChange, onTitleChange, quickStarting, submitDisabled, timezone, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "grid gap-4 md:grid-cols-2",
		onSubmit,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingDetailsSection, {
				disabled: quickStarting,
				title,
				titleId: "quick-meet-title",
				titlePlaceholder: "Instant client sync",
				description,
				descriptionId: "quick-meet-description",
				descriptionPlaceholder: "Agenda or context for this meeting",
				onTitleChange,
				onDescriptionChange
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingTimingSection, {
				disabled: quickStarting,
				durationId: "quick-meet-duration",
				durationMinutes,
				showStartTime: false,
				timezone,
				timezoneId: "quick-meet-timezone",
				minuteStep: 5,
				onDurationMinutesChange,
				onTimezoneChange
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingAttendeesSection, {
				label: "Invite Users",
				inputId: "quick-attendees-input",
				inputValue: attendeeInput,
				selectedEmails: attendeeEmails,
				disabled: quickStarting,
				emptyStateText: "Add people by selecting users below or typing email addresses.",
				helperText: "Use Enter, Tab, comma, or semicolon to add typed emails. Add at least one participant before starting the room.",
				suggestions: attendeeSuggestions,
				onInputChange: onAttendeeInputChange,
				onInputKeyDown: onAttendeeKeyDown,
				onCommitInput: onCommitAttendeeInput,
				onRemoveEmail: onRemoveAttendee,
				onAddSuggestedEmail: onAddSuggestedAttendee
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "md:col-span-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: cn(getButtonClasses("primary"), pressableScaleClass),
						disabled: quickStarting || submitDisabled,
						children: quickStarting ? "Starting…" : "Start Room"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						className: getButtonClasses("outline"),
						onClick: onCancel,
						disabled: quickStarting,
						children: "Cancel"
					})]
				})
			})
		]
	});
}
function QuickMeetDialog({ open, quickStarting, title, description, durationMinutes, timezone, attendeeInput, attendeeEmails, attendeeSuggestions, submitDisabled, onOpenChange, onCancel, onSubmit, onTitleChange, onDescriptionChange, onDurationMinutesChange, onTimezoneChange, onAttendeeInputChange, onAttendeeKeyDown, onCommitAttendeeInput, onRemoveAttendee, onAddSuggestedAttendee }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickMeetDialogHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickMeetDialogForm, {
				quickStarting,
				title,
				description,
				durationMinutes,
				timezone,
				attendeeInput,
				attendeeEmails,
				attendeeSuggestions,
				submitDisabled,
				onCancel,
				onSubmit,
				onTitleChange,
				onDescriptionChange,
				onDurationMinutesChange,
				onTimezoneChange,
				onAttendeeInputChange,
				onAttendeeKeyDown,
				onCommitAttendeeInput,
				onRemoveAttendee,
				onAddSuggestedAttendee
			})]
		})
	});
}
function UpcomingMeetingsEmptyState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		variant: "card",
		icon: CalendarDays,
		title: "No upcoming meetings yet",
		description: "Schedule a meeting to see it here.",
		className: "border-muted/40 bg-muted/10"
	});
}
function UpcomingMeetingsLoadingState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: [
			0,
			1,
			2
		].map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full rounded-lg" }, slot))
	});
}
function UpcomingMeetingItemCard({ meeting, canSchedule, cancellingMeetingId, onOpenInSiteMeeting, onRescheduleMeeting, onCancelMeeting, onMarkCompleted }) {
	const transcriptProcessingState = normalizeMeetingProcessingState(meeting.transcriptProcessingState);
	const notesProcessingState = normalizeMeetingProcessingState(meeting.notesProcessingState);
	const postCallProcessing = transcriptProcessingState === "processing" || notesProcessingState === "processing";
	const handleOpenInSiteMeeting = () => onOpenInSiteMeeting(meeting);
	const handleRescheduleMeeting = () => onRescheduleMeeting(meeting);
	const handleCancelMeeting = () => onCancelMeeting(meeting);
	const handleMarkCompleted = () => onMarkCompleted(meeting.legacyId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-lg border border-muted/60 p-4", listItemEnterClass),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium text-foreground",
							children: meeting.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								formatLocalDateTime(meeting.startTimeMs, meeting.timezone),
								" - ",
								formatLocalDateTime(meeting.endTimeMs, meeting.timezone)
							]
						}),
						meeting.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: meeting.description
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-end gap-2",
					children: [postCallProcessing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "info",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 size-3 animate-spin" }), "Post-call processing"]
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: statusVariant(meeting.status),
						children: meeting.status.replace("_", " ")
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					meeting.status !== "cancelled" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: getButtonClasses("primary"),
						onClick: handleOpenInSiteMeeting,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "mr-1 size-3.5" }), "Join Room"]
					}) : null,
					meeting.meetLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						variant: "outline",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: meeting.meetLink,
							target: "_blank",
							rel: "noreferrer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "mr-1 size-3.5" }), "Open Share Link"]
						})
					}) : null,
					canSchedule && meeting.status !== "completed" && meeting.status !== "cancelled" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: handleRescheduleMeeting,
							children: "Reschedule"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: handleCancelMeeting,
							disabled: cancellingMeetingId === meeting.legacyId,
							children: cancellingMeetingId === meeting.legacyId ? "Cancelling…" : "Cancel"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: handleMarkCompleted,
							children: "Mark Completed"
						})
					] }) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground",
				children: [
					transcriptProcessingState === "processing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "info",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 size-3 animate-spin" }), "Finalizing transcript"]
					}) : transcriptProcessingState === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "destructive",
						children: "Transcript finalization failed"
					}) : meeting.transcriptUpdatedAtMs ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "info",
						children: ["Transcript saved ", formatLocalDateTime(meeting.transcriptUpdatedAtMs, meeting.timezone)]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: "Transcript not saved"
					}),
					meeting.transcriptSource ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						children: ["Source: ", meeting.transcriptSource]
					}) : null,
					notesProcessingState === "processing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "info",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 size-3 animate-spin" }), "Generating AI notes"]
					}) : notesProcessingState === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "destructive",
						children: "AI notes generation failed"
					}) : meeting.notesUpdatedAtMs ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "success",
						children: ["Notes saved ", formatLocalDateTime(meeting.notesUpdatedAtMs, meeting.timezone)]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: "Notes pending"
					}),
					meeting.notesSummary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: meeting.notesModel ? `AI notes: ${meeting.notesModel}` : "Manual notes"
					}) : null
				]
			}),
			meeting.transcriptProcessingError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-destructive",
				children: meeting.transcriptProcessingError
			}) : null,
			meeting.notesProcessingError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-destructive",
				children: meeting.notesProcessingError
			}) : null,
			meeting.notesSummary ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 rounded-md bg-muted/40 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
						children: meeting.notesModel ? "AI Meeting Notes" : "Meeting Notes"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingNotesMarkdown, {
						className: "mt-1",
						content: meeting.notesSummary
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingArtifactsDownload, {
						className: "mt-3",
						compact: true,
						legacyId: meeting.legacyId,
						meetingTitle: meeting.title,
						notesStorageId: meeting.notesStorageId,
						notesSummary: meeting.notesSummary,
						transcriptStorageId: meeting.transcriptStorageId,
						transcriptText: meeting.transcriptText
					})
				]
			}) : null,
			!meeting.notesSummary && notesProcessingState === "processing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: "The meeting ended. Transcript finalization and AI notes generation started automatically."
			}) : null,
			!meeting.notesSummary && notesProcessingState === "idle" && meeting.transcriptText ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: "Transcript captured. You can generate AI notes from the in-site room or save manual notes there."
			}) : null
		]
	});
}
var GOOGLE_CALENDAR_URL = "https://calendar.google.com/";
function UpcomingMeetingsCard(props) {
	const { meetings, loading = false, canSchedule, googleWorkspaceConnected = false, cancellingMeetingId, onOpenInSiteMeeting, onRescheduleMeeting, onCancelMeeting, onMarkCompleted } = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: cn(DASHBOARD_THEME.cards.base, "h-full"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "space-y-3 border-b border-muted/40 pb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 flex-1 items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn(DASHBOARD_THEME.icons.container, "size-10 shrink-0 rounded-lg"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, {
							className: "size-5",
							"aria-hidden": true
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1 space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base leading-tight",
							children: "Upcoming meetings"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
							className: "text-pretty",
							children: "Scheduled rooms and calendar-backed calls for this workspace."
						})]
					})]
				}), googleWorkspaceConnected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					className: cn(getButtonClasses("outline"), "shrink-0"),
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: GOOGLE_CALENDAR_URL,
						target: "_blank",
						rel: "noreferrer",
						children: "View Calendar"
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					className: cn(getButtonClasses("outline"), "shrink-0"),
					disabled: true,
					children: "View Calendar"
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "space-y-3 pt-4",
			children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpcomingMeetingsLoadingState, {}) : meetings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpcomingMeetingsEmptyState, {}) : meetings.map((meeting) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpcomingMeetingItemCard, {
				meeting,
				canSchedule,
				cancellingMeetingId,
				onOpenInSiteMeeting,
				onRescheduleMeeting,
				onCancelMeeting,
				onMarkCompleted
			}, meeting.legacyId))
		})]
	});
}
function ActiveMeetingRoomSection({ meetingRoomKey, ...meetingRoomProps }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: DASHBOARD_THEME.layout.container,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingRoomPage, { ...meetingRoomProps }, meetingRoomKey)
	});
}
function SharedRoomLoadingSection(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: DASHBOARD_THEME.layout.container,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingRoomLoadingState, { ...props })
	});
}
function MeetingsTimezoneFooter({ timezone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "flex items-center justify-center gap-2 border-t border-border/60 pt-6 text-center text-sm text-muted-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, {
				className: "size-4 shrink-0",
				"aria-hidden": true
			}),
			"All times are shown in ",
			timezone
		]
	});
}
function MeetingsMobileWorkspace({ createMeetingCardProps, upcomingMeetingsCardProps }) {
	const [tab, setTab] = (0, import_react.useState)("upcoming");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
		value: tab,
		onValueChange: setTab,
		className: "w-full lg:hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
				className: "grid h-auto w-full grid-cols-2 gap-1 p-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
					value: "upcoming",
					className: "gap-1.5 text-xs sm:text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "size-3.5 shrink-0" }), "Upcoming"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
					value: "schedule",
					className: "gap-1.5 text-xs sm:text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "size-3.5 shrink-0" }), "Schedule"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "upcoming",
				className: "mt-4 focus-visible:outline-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpcomingMeetingsCard, { ...upcomingMeetingsCardProps })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "schedule",
				className: "mt-4 focus-visible:outline-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateMeetingCard, { ...createMeetingCardProps })
			})
		]
	});
}
function MeetingsDefaultView({ editingMeeting, meetingsHeaderProps, meetingCancelDialogProps, quickMeetDialogProps, createMeetingCardProps, rescheduleMeetingCardProps, showPreviewMode, showReadOnlyAccessAlert, upcomingMeetingsCardProps, timezone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: DASHBOARD_THEME.layout.container,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingsHeader, { ...meetingsHeaderProps }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [showPreviewMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
					className: "border-accent/25 bg-accent/5 text-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
							className: "text-primary",
							"aria-hidden": true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Preview mode" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: "Meetings use sample data in preview mode. You can browse upcoming calls and open the native room workspace, but scheduling and integration actions are disabled." })
					]
				}) : null, showReadOnlyAccessAlert ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
					className: "border-muted/60 bg-muted/40 text-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, {
							className: "text-muted-foreground",
							"aria-hidden": true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Read-only access" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: "Client users can join and review meetings, but scheduling is restricted to admin and team members." })
					]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickMeetDialog, { ...quickMeetDialogProps }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingCancelDialog, { ...meetingCancelDialogProps }),
					editingMeeting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RescheduleMeetingCard, { ...rescheduleMeetingCardProps }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingsMobileWorkspace, {
						createMeetingCardProps,
						upcomingMeetingsCardProps
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden gap-6 lg:grid lg:grid-cols-12 lg:items-start",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "lg:col-span-7",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateMeetingCard, { ...createMeetingCardProps })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "lg:col-span-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpcomingMeetingsCard, { ...upcomingMeetingsCardProps })
						})]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingsTimezoneFooter, { timezone })
				]
			})
		]
	});
}
function buildMeetingRoomKey(meeting, sharedRoomName) {
	return [
		meeting.legacyId,
		meeting.calendarEventId,
		meeting.roomName,
		sharedRoomName
	].filter(Boolean).join(":") || "active-meeting";
}
function MeetingsPageShellContent({ context, shell }) {
	const { resolvedActiveInSiteMeeting, sharedRoomName } = context;
	const { canSchedule, isPreviewMode, editingMeeting, closeMeetingRoom, handleMeetingUpdated, createMeetingCardProps, meetingsHeaderProps, meetingCancelDialogProps, quickMeetDialogProps, rescheduleMeetingCardProps, upcomingMeetingsCardProps, timezone } = shell;
	if (resolvedActiveInSiteMeeting) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActiveMeetingRoomSection, {
		meetingRoomKey: buildMeetingRoomKey(resolvedActiveInSiteMeeting, sharedRoomName),
		meeting: resolvedActiveInSiteMeeting,
		canRecord: canSchedule && !isPreviewMode,
		onMeetingUpdated: handleMeetingUpdated,
		fallbackRoomName: sharedRoomName,
		onClose: closeMeetingRoom
	});
	if (sharedRoomName) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SharedRoomLoadingSection, {
		sharedRoomName,
		onBack: closeMeetingRoom
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingsDefaultView, {
		editingMeeting: Boolean(editingMeeting),
		meetingsHeaderProps,
		meetingCancelDialogProps,
		quickMeetDialogProps,
		createMeetingCardProps,
		rescheduleMeetingCardProps,
		showPreviewMode: isPreviewMode,
		showReadOnlyAccessAlert: !canSchedule,
		upcomingMeetingsCardProps,
		timezone
	});
}
function useMeetingsPageShellProps() {
	const { canSchedule, cancelDialogMeeting, cancellingMeetingId, closeMeetingRoom, description, durationMinutes, editingMeeting, handleCancelMeeting, handleConfirmCancelMeeting, handleConnectGoogleWorkspace: connectGoogleWorkspace, handleDisconnectGoogleWorkspace: disconnectGoogleWorkspace, handleMarkCompleted, handleMeetingUpdated, handleRescheduleMeeting, handleScheduleMeeting, handleSubmitQuickMeet, googleWorkspaceStatusLoading, isPreviewMode, meetingDate, meetingTime, openInSiteMeeting, quickAttendeeDraft, quickAttendees, quickMeetDescription, quickMeetDialogOpen, quickMeetDurationMinutes, quickMeetTitle, quickStarting, resetQuickMeetForm, resetScheduleForm, scheduleAttendeeDraft, scheduleAttendees, scheduleDisabled, scheduleRequiresGoogleWorkspace, scheduling, setCancelDialogMeeting, setDescription, setDurationMinutes, setMeetingDate, setMeetingTime, setQuickMeetDescription, setQuickMeetDialogOpen, setQuickMeetDurationMinutes, setQuickMeetTitle, setTimezone, setTitle, timezone, title, upcomingMeetings, upcomingMeetingsLoading, resolvedGoogleWorkspaceStatus } = useMeetingsPageContext();
	const handleConnectGoogleWorkspaceAction = () => {
		connectGoogleWorkspace();
	};
	const handleDisconnectGoogleWorkspaceAction = () => {
		disconnectGoogleWorkspace();
	};
	const handleStartQuickMeet = () => {
		setQuickMeetDialogOpen(true);
	};
	const handleMeetingCancelDialogOpenChange = (open) => {
		if (!open && !cancellingMeetingId) setCancelDialogMeeting(null);
	};
	const handleQuickMeetDialogOpenChange = (open) => {
		if (quickStarting) return;
		setQuickMeetDialogOpen(open);
		if (!open) resetQuickMeetForm();
	};
	const handleQuickMeetCancel = () => {
		if (quickStarting) return;
		setQuickMeetDialogOpen(false);
		resetQuickMeetForm();
	};
	const handleMarkCompletedClick = (legacyId) => {
		handleMarkCompleted(legacyId);
	};
	const scheduleCardSharedProps = {
		meetingDate,
		meetingTime,
		durationMinutes,
		timezone,
		title,
		description,
		attendeeInput: scheduleAttendees.input,
		attendeeEmails: scheduleAttendees.emails,
		attendeeSuggestions: scheduleAttendees.suggestions,
		scheduleRequiresGoogleWorkspace,
		googleWorkspaceConnected: Boolean(resolvedGoogleWorkspaceStatus?.connected),
		scheduleDisabled,
		submitDisabled: scheduleDisabled || !scheduleAttendeeDraft.hasParticipants,
		scheduling,
		onMeetingDateChange: setMeetingDate,
		onMeetingTimeChange: setMeetingTime,
		onDurationMinutesChange: setDurationMinutes,
		onTimezoneChange: setTimezone,
		onTitleChange: setTitle,
		onDescriptionChange: setDescription,
		onAttendeeInputChange: scheduleAttendees.setInput,
		onAttendeeKeyDown: scheduleAttendees.handleKeyDown,
		onCommitAttendeeInput: scheduleAttendees.commitInput,
		onRemoveAttendee: scheduleAttendees.removeEmail,
		onAddSuggestedAttendee: scheduleAttendees.addSuggestedEmail,
		onSubmit: handleScheduleMeeting
	};
	return {
		canSchedule,
		isPreviewMode,
		editingMeeting,
		closeMeetingRoom,
		handleMeetingUpdated,
		createMeetingCardProps: scheduleCardSharedProps,
		meetingsHeaderProps: {
			googleWorkspaceConnected: Boolean(resolvedGoogleWorkspaceStatus?.connected),
			googleWorkspaceStatusLoading,
			canSchedule: canSchedule && !isPreviewMode,
			quickStarting,
			quickMeetDisabled: isPreviewMode || googleWorkspaceStatusLoading || !resolvedGoogleWorkspaceStatus?.connected,
			onStartQuickMeet: handleStartQuickMeet,
			onConnectGoogleWorkspace: handleConnectGoogleWorkspaceAction,
			onManageGoogleWorkspace: handleDisconnectGoogleWorkspaceAction
		},
		meetingCancelDialogProps: {
			meeting: cancelDialogMeeting,
			cancellingMeetingId,
			onOpenChange: handleMeetingCancelDialogOpenChange,
			onConfirm: handleConfirmCancelMeeting
		},
		quickMeetDialogProps: {
			open: quickMeetDialogOpen,
			quickStarting,
			title: quickMeetTitle,
			description: quickMeetDescription,
			durationMinutes: quickMeetDurationMinutes,
			timezone,
			attendeeInput: quickAttendees.input,
			attendeeEmails: quickAttendees.emails,
			attendeeSuggestions: quickAttendees.suggestions,
			submitDisabled: !quickAttendeeDraft.hasParticipants,
			onOpenChange: handleQuickMeetDialogOpenChange,
			onCancel: handleQuickMeetCancel,
			onSubmit: handleSubmitQuickMeet,
			onTitleChange: setQuickMeetTitle,
			onDescriptionChange: setQuickMeetDescription,
			onDurationMinutesChange: setQuickMeetDurationMinutes,
			onTimezoneChange: setTimezone,
			onAttendeeInputChange: quickAttendees.setInput,
			onAttendeeKeyDown: quickAttendees.handleKeyDown,
			onCommitAttendeeInput: quickAttendees.commitInput,
			onRemoveAttendee: quickAttendees.removeEmail,
			onAddSuggestedAttendee: quickAttendees.addSuggestedEmail
		},
		rescheduleMeetingCardProps: {
			...scheduleCardSharedProps,
			onReset: resetScheduleForm
		},
		upcomingMeetingsCardProps: {
			meetings: upcomingMeetings,
			loading: upcomingMeetingsLoading,
			canSchedule: canSchedule && !isPreviewMode,
			googleWorkspaceConnected: Boolean(resolvedGoogleWorkspaceStatus?.connected),
			cancellingMeetingId,
			onOpenInSiteMeeting: openInSiteMeeting,
			onRescheduleMeeting: handleRescheduleMeeting,
			onCancelMeeting: handleCancelMeeting,
			onMarkCompleted: handleMarkCompletedClick
		},
		timezone
	};
}
function MeetingsPageShell() {
	const context = useMeetingsPageContext();
	const shell = useMeetingsPageShellProps();
	const { googleWorkspaceStatusLoading, meetingsQueryError, resolvedActiveInSiteMeeting, sharedRoomName, upcomingMeetingsLoading } = context;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingsPageShellBoundary, {
		loading: !resolvedActiveInSiteMeeting && !sharedRoomName && googleWorkspaceStatusLoading && upcomingMeetingsLoading,
		queryError: meetingsQueryError,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingsPageShellContent, {
			context: {
				resolvedActiveInSiteMeeting,
				sharedRoomName
			},
			shell
		})
	});
}
function MeetingsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMotionShell, {
		reveal: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingsPageProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingsPageShell, {}) })
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeetingsPage, {});
//#endregion
export { SplitComponent as component };
