import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, c as useConvex, i as useQueries, l as useMutation, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { r as motion_exports } from "./motion-DtlbbvFg.mjs";
import { A as getPreviewCollaborationParticipants, M as getPreviewDirectAutoReply, N as getPreviewDirectConversations, O as getPreviewCollaborationAutoReply, P as getPreviewDirectMessages, V as getPreviewProjects, j as getPreviewCollaborationThreadReplies, k as getPreviewCollaborationMessages } from "./preview-data-CXkRNfsX.mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { _ as format, r as parseISO } from "../_libs/date-fns.mjs";
import { a as chromaticTransitionClass, g as listRowEnterAnimationClass, u as fadeInDownVariants } from "./motion-Cf6ujF0h.mjs";
import { n as buttonVariants, t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { a as CardHeader, n as CardContent, t as Card } from "./card-CDBnK3ba.mjs";
import { t as Skeleton } from "./skeleton-CQ4LJS0E.mjs";
import { s as logError, t as asErrorMessage } from "./convex-errors-sHK0JmZ7.mjs";
import { a as notifyInfo, c as reportConvexFailure, i as notifyFailure, o as notifySuccess } from "./notifications-DQZKskhM.mjs";
import { n as usePathname, r as useRouter$1 } from "./navigation-C1M-rNAu.mjs";
import { n as api } from "./rate-limiter-convex-Dr72h9nD.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { D as filesApi, E as directMessagesApi, I as projectsApi, S as collaborationChannelsApi, Y as usersApi, _ as api$1, b as collaborationApi, q as tasksApi, x as collaborationChannelAvatarsApi } from "./convex-api-msEHRhRb.mjs";
import { n as useClientContext } from "./client-context-BNynWehF.mjs";
import { An as FileText, Bn as EllipsisVertical, Cr as Camera, F as Sparkles, Gr as Archive, I as Smile, Ir as Bell, J as Send, Jt as Lock, K as Settings2, Kr as ArchiveRestore, Kt as Mail, Lr as BellOff, Rn as ExternalLink, Rr as AtSign, Rt as MessageSquare, Sr as ChartColumn, Ur as ArrowLeft, Vt as MessageCircle, W as Share2, Wr as ArrowDown, Y as Search, Yt as LoaderCircle, Zt as ListTodo, _r as CheckCheck, cr as CircleAlert, dn as Inbox, et as Reply, f as User, fn as Image, ft as Pin, gr as Check, gt as Pencil, i as X, jn as FileStack, lt as Plus, n as ZoomIn, pr as ChevronRight, pt as PinOff, rt as RefreshCw, tn as Link2, u as Users, un as Info, vn as Hash, w as Trash2, wn as Forward, wr as Calendar, xt as Paperclip } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cuo0TTXb.mjs";
import { a as DialogFooter, c as DialogTrigger, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-C8tBdgAy.mjs";
import { t as Input } from "./input-DuOB9ezo.mjs";
import { t as Label } from "./label-B_FvRq1I.mjs";
import { t as FadeIn } from "./animate-in-JYv0iBIt.mjs";
import { a as TabsTrigger, i as TabsList, n as Tabs, r as TabsContent } from "./tabs-BP_mm-cH.mjs";
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip } from "./tooltip-BwcfatA2.mjs";
import { a as getIconContainerClasses, n as PAGE_TITLES, t as DASHBOARD_THEME } from "./dashboard-theme-DM5oBGdY.mjs";
import { t as Separator } from "./separator-DGLaDYU_.mjs";
import { t as Checkbox } from "./checkbox-DP7YqpAp.mjs";
import { r as useConvexQueryError, t as mergeQueryErrors } from "./use-convex-query-error-P2IX7lhG.mjs";
import { t as Textarea } from "./textarea-C0M2IvQZ.mjs";
import { n as AlertDescription, r as AlertTitle, t as Alert } from "./alert-DYeH1Q3p.mjs";
import { n as MotionPressable } from "./motion-primitives-HmftJNmb.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-DghqGd0Q.mjs";
import { t as ScrollArea } from "./scroll-area-DnXuhDTw.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as PageSkeletonBoundary } from "./page-skeleton-boundary-ZBP950Us.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-BwHc7N7y.mjs";
import { t as Calendar$1 } from "./calendar-9B6zD0Is.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { i as useQuery$1, o as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { i as DropdownMenuItem, l as DropdownMenuTrigger, r as DropdownMenuContent, t as DropdownMenu } from "./dropdown-menu-CJEJ0oqe.mjs";
import { t as ConfirmDialog } from "./confirm-dialog-D0Fe9niR.mjs";
import { t as PageMotionShell } from "./page-motion-shell-Ci2leIYf.mjs";
import { r as useUrlSearchParamsContext } from "./use-url-search-params-CvniTNfQ.mjs";
import { n as useProjectContext } from "./project-context-HGgHVwvo.mjs";
import { t as isFeatureEnabled } from "./features-DXQ1HU1z.mjs";
import { a as buildCollaborationExportCharts } from "./cohorts-spreadsheet-charts-C3_blKf3.mjs";
import { t as DashboardPageHero } from "./dashboard-page-hero-BIWBoJtP.mjs";
import { t as Progress } from "./progress-C-kxMCfG.mjs";
import { n as uploadStorageFileWithPublicUrl, t as uploadStorageFile } from "./upload-storage-file-CUAnugSD.mjs";
import { t as LazyImage } from "./lazy-image-69k9UCD2.mjs";
import { a as CHAT_MESSAGE_BODY_CLASS, c as buildCollaborationDmShareUrl, d as formatConversationSnippet, f as formatRelativeTime, h as normalizeTeamMembers, l as collectSharedFiles, m as isLikelyImageUrl, n as CHAT_CONVERSATION_ROW_CLASS, o as aggregateTeamMembers, p as getInitials$3, r as CHAT_LIST_PREVIEW_CLASS, s as buildCollaborationChannelShareUrl, t as CHANNEL_TYPE_COLORS, u as extractUrlsFromContent } from "./utils-DWnHfwOl.mjs";
import { n as ChatMediaGallery, r as ImagePreviewModal } from "./use-voice-input-CLPTluum.mjs";
import { t as ChatTypingIndicator } from "./use-client-relative-time-BtAGXTYW.mjs";
import { a as exportCohortsSpreadsheetRows } from "./cohorts-spreadsheet-oHwGWk0s.mjs";
import { t as shouldSendCollaborationEmailCopy } from "./collaboration-email-notify-B_BBULEN.mjs";
import { t as v4 } from "../_libs/uuid.mjs";
import { t as ClientFormattedDate } from "./client-formatted-date-CcMUTrKu.mjs";
import { t as EmptyState } from "./empty-state-sOehX0F0.mjs";
import { r as ResponsiveFormSheet } from "./dashboard-workspace-theme-Ckmkwu5P.mjs";
import { t as LiveRegion } from "./live-region-BmnQNfB0.mjs";
import { n as Theme } from "../_libs/emoji-picker-react+flairup.mjs";
import { C as extractMentionsFromContent, D as formatPriorityLabel, I as priorityAccentColors, K as uploadTaskAttachment, M as isFutureTaskDueDateValue, P as isTaskDueDateDisabled, S as emoji_picker_default, a as PendingAttachmentsList, b as buildPendingTaskAttachments, c as RichComposer, d as TASKS_THEME, f as TaskContextChip, g as TaskModalError, h as TaskModalActions, m as TaskFormSection, n as MessageAttachments, p as TaskFormField, r as MessageContent, s as ReplyIndicator, t as ClientRelativeTime } from "./task-attachments-Ji71G8Bp.mjs";
import { n as TYPING_TIMEOUT_MS, r as validateAttachments, t as COLLABORATION_REACTION_SET } from "./utils-Dp3pETO6.mjs";
import { n as encodeTimestampIdCursor, t as decodeTimestampIdCursor } from "./pagination-DHcNSy7D.mjs";
import { n as emitDashboardRefresh, t as PROJECT_STATUSES } from "./refresh-bus-dqOi1W-b.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/collaboration-CeWLXzDv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CollaborationSkeleton() {
	const tabSlots = [
		"tab-1",
		"tab-2",
		"tab-3"
	];
	const folderSlots = [
		"folder-1",
		"folder-2",
		"folder-3",
		"folder-4",
		"folder-5",
		"folder-6"
	];
	const messageSlots = [
		"message-1",
		"message-2",
		"message-3",
		"message-4",
		"message-5",
		"message-6",
		"message-7",
		"message-8"
	];
	const sidebarSlots = [
		"sidebar-1",
		"sidebar-2",
		"sidebar-3",
		"sidebar-4",
		"sidebar-5"
	];
	const insightSlots = [
		"insight-1",
		"insight-2",
		"insight-3"
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-56" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-80" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "border-muted/60 bg-background",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "border-b border-muted/40 pb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap items-center gap-3",
					children: tabSlots.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-40" }, slot))
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "flex flex-col gap-4 p-0 lg:flex-row",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full max-w-xs border-r border-muted/30 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 space-y-3",
							children: folderSlots.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md border border-muted/60 bg-muted/10 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-2 h-3 w-32" })]
							}, slot))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {
						orientation: "vertical",
						className: "hidden h-[640px] lg:block"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 space-y-4 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-32" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-44" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-3",
								children: messageSlots.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-10 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 space-y-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-32" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-48" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-36" })
										]
									})]
								}, slot))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-48" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-28" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-10 rounded-full" })
									]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {
						orientation: "vertical",
						className: "hidden h-[640px] lg:block"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full max-w-xs space-y-4 border-l border-muted/30 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-44" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-3",
								children: sidebarSlots.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-md border border-muted/60 bg-muted/10 p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-36" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-2 h-3 w-28" })]
								}, slot))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-40" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-3",
								children: insightSlots.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-md border border-muted/60 bg-muted/10 p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-32" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 grid grid-cols-3 gap-2",
										children: insightSlots.map((innerSlot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-full" }, innerSlot))
									})]
								}, slot))
							})
						]
					})
				]
			})]
		})]
	});
}
function useAttachments({ userId, workspaceId }) {
	const convex = useConvex();
	const generateUploadUrl = useMutation(collaborationApi.generateUploadUrl);
	const syncMetadata = useMutation(collaborationApi.syncMetadata);
	const getPublicUrl = (args) => {
		if (!workspaceId) throw new Error("Workspace context missing");
		return convex.query(filesApi.getPublicUrl, {
			workspaceId,
			storageId: args.storageId
		});
	};
	const [pendingAttachments, setPendingAttachments] = (0, import_react.useState)([]);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const handleAddAttachments = (files) => {
		const result = validateAttachments(files, pendingAttachments.length, 5);
		if (result.errors.length > 0) notifyFailure({
			title: "Some files couldn't be attached",
			message: result.errors.join(". ")
		});
		if (result.valid.length > 0) setPendingAttachments((prev) => [...prev, ...result.valid]);
	};
	const handleRemoveAttachment = (attachmentId) => {
		setPendingAttachments((prev) => prev.filter((attachment) => attachment.id !== attachmentId));
	};
	const clearAttachments = () => {
		setPendingAttachments([]);
	};
	const uploadAttachments = async (attachments) => {
		if (!userId || !workspaceId || attachments.length === 0) return [];
		setUploading(true);
		try {
			return await Promise.all(attachments.map(async (attachment) => {
				const { storageId, url } = await uploadStorageFileWithPublicUrl({
					file: attachment.file,
					contentType: attachment.mimeType || "application/octet-stream",
					generateUploadUrl: () => generateUploadUrl({}),
					syncMetadata: (args) => syncMetadata(args),
					getPublicUrl
				});
				return {
					name: attachment.name,
					url,
					storageId,
					type: attachment.mimeType,
					size: attachment.sizeLabel
				};
			}));
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useAttachments:uploadAttachments",
				title: "Upload failed",
				fallbackMessage: "Upload failed"
			});
			return [];
		} finally {
			setUploading(false);
		}
	};
	return {
		pendingAttachments,
		uploading,
		handleAddAttachments,
		handleRemoveAttachment,
		clearAttachments,
		uploadAttachments,
		setUploading
	};
}
function useAttachmentsData({ userId, workspaceId }) {
	return useAttachments({
		userId,
		workspaceId
	});
}
/** undefined = auto-pick default; null = explicitly no channel (DM view). */
function resolveSelectedChannelId(channels, pickedChannelId, visibleClientId = null) {
	if (channels.length === 0) return null;
	if (pickedChannelId === null) return null;
	if (pickedChannelId && channels.some((channel) => channel.id === pickedChannelId)) return pickedChannelId;
	if (pickedChannelId !== void 0) return null;
	const preferredClientChannelId = visibleClientId ? `client-${visibleClientId}` : null;
	return (preferredClientChannelId && channels.some((channel) => channel.id === preferredClientChannelId) ? preferredClientChannelId : null) ?? channels[0]?.id ?? null;
}
function useChannelsData({ clients, projects, customChannels, fallbackDisplayName, fallbackRole, visibleClientId = null, channelAvatars }) {
	const avatarForChannel = (channelId) => channelAvatars?.get(channelId) ?? null;
	const aggregatedTeamMembers = aggregateTeamMembers(clients, fallbackDisplayName, fallbackRole);
	const visibleClients = visibleClientId ? clients.filter((client) => client.id === visibleClientId) : clients;
	const channels = (() => {
		const teamChannel = {
			id: "team-agency",
			name: "Agency Team",
			type: "team",
			clientId: null,
			projectId: null,
			teamMembers: aggregatedTeamMembers,
			avatarUrl: avatarForChannel("team-agency")
		};
		const clientChannels = visibleClients.map((client) => {
			const id = `client-${client.id}`;
			return {
				id,
				name: client.name,
				type: "client",
				clientId: client.id,
				projectId: null,
				teamMembers: normalizeTeamMembers(client.teamMembers),
				avatarUrl: avatarForChannel(id)
			};
		});
		const projectChannels = projects.map((project) => {
			const relatedClient = clients.find((client) => client.id === project.clientId);
			const id = `project-${project.id}`;
			return {
				id,
				name: project.name,
				type: "project",
				clientId: project.clientId,
				projectId: project.id,
				teamMembers: relatedClient ? normalizeTeamMembers(relatedClient.teamMembers) : aggregatedTeamMembers,
				avatarUrl: avatarForChannel(id)
			};
		});
		return [
			teamChannel,
			...customChannels.map((channel) => ({
				id: channel.legacyId,
				name: channel.name,
				type: "team",
				clientId: null,
				projectId: null,
				description: channel.description ?? null,
				visibility: channel.visibility ?? "private",
				memberIds: Array.isArray(channel.memberIds) ? channel.memberIds : [],
				isCustom: true,
				teamMembers: Array.isArray(channel.memberSummaries) && channel.memberSummaries.length > 0 ? channel.memberSummaries.map((member) => ({
					id: member.id,
					name: member.name,
					role: member.role?.trim() || "Contributor"
				})) : aggregatedTeamMembers,
				avatarUrl: avatarForChannel(channel.legacyId)
			})),
			...clientChannels,
			...projectChannels
		];
	})();
	const [pickedChannelId, setPickedChannelId] = (0, import_react.useState)(void 0);
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const selectedChannelId = resolveSelectedChannelId(channels, pickedChannelId, visibleClientId);
	const selectedChannel = channels.find((channel) => channel.id === selectedChannelId) ?? null;
	const filteredChannels = (() => {
		if (!searchQuery.trim()) return channels;
		const query = searchQuery.toLowerCase().trim();
		return channels.filter((channel) => channel.name.toLowerCase().includes(query));
	})();
	const selectChannel = (channelId) => {
		setPickedChannelId(channelId);
	};
	return {
		aggregatedTeamMembers,
		channels,
		selectedChannelId,
		setSelectedChannelId: setPickedChannelId,
		selectedChannel,
		searchQuery,
		setSearchQuery,
		filteredChannels,
		selectChannel,
		channelParticipants: (() => {
			if (!selectedChannel) return [];
			const map = /* @__PURE__ */ new Map();
			selectedChannel.teamMembers.forEach((member) => {
				const name = member.name.trim();
				if (!name) return;
				const key = name.toLowerCase();
				if (!map.has(key)) map.set(key, {
					name,
					role: member.role?.trim() || "Contributor"
				});
			});
			if (fallbackDisplayName) {
				const key = fallbackDisplayName.toLowerCase();
				if (!map.has(key)) map.set(key, {
					name: fallbackDisplayName,
					role: fallbackRole
				});
			}
			return Array.from(map.values());
		})(),
		totalChannels: channels.length,
		totalParticipants: aggregatedTeamMembers.length
	};
}
function normalizeField$1(value) {
	if (!value) return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}
function parseChannelMessageSearchQuery(input) {
	const tokens = input.split(/\s+/).filter(Boolean);
	const terms = [];
	let sender = null;
	let attachment = null;
	let mention = null;
	let start = null;
	let end = null;
	tokens.forEach((token) => {
		const lower = token.toLowerCase();
		if (lower.startsWith("from:")) sender = token.slice(5);
		else if (lower.startsWith("attachment:")) attachment = token.slice(11);
		else if (lower.startsWith("mention:")) mention = token.slice(8);
		else if (lower.startsWith("before:")) end = token.slice(7);
		else if (lower.startsWith("after:")) start = token.slice(6);
		else terms.push(token);
	});
	const highlights = [...terms];
	if (sender) highlights.push(sender);
	if (attachment) highlights.push(attachment);
	if (mention) highlights.push(mention);
	return {
		q: terms.join(" ").trim(),
		sender: normalizeField$1(sender),
		attachment: normalizeField$1(attachment),
		mention: normalizeField$1(mention),
		start: normalizeField$1(start),
		end: normalizeField$1(end),
		highlights: highlights.filter(Boolean)
	};
}
function filterChannelMessagesForSearch(messages, search) {
	const queryTerms = search.q.toLowerCase().split(/\s+/).filter(Boolean);
	const senderSearch = search.sender?.toLowerCase() ?? null;
	const attachmentSearch = search.attachment?.toLowerCase() ?? null;
	const mentionSearch = search.mention?.toLowerCase() ?? null;
	const startMs = search.start ? Date.parse(search.start) : NaN;
	const endMs = search.end ? Date.parse(search.end) : NaN;
	return messages.filter((message) => {
		const createdAtMs = message.createdAt ? Date.parse(message.createdAt) : NaN;
		const haystack = `${message.content} ${message.senderName}`.toLowerCase();
		const matchesQuery = queryTerms.every((term) => haystack.includes(term));
		const matchesSender = !senderSearch || message.senderName.toLowerCase().includes(senderSearch);
		const matchesAttachment = !attachmentSearch || (message.attachments ?? []).some((attachment) => attachment.name.toLowerCase().includes(attachmentSearch));
		const matchesMention = !mentionSearch || (message.mentions ?? []).some((mention) => {
			return mention.name.toLowerCase().includes(mentionSearch) || mention.slug.toLowerCase().includes(mentionSearch);
		});
		return matchesQuery && matchesSender && matchesAttachment && matchesMention && (!Number.isFinite(startMs) || Number.isFinite(createdAtMs) && createdAtMs >= startMs) && (!Number.isFinite(endMs) || Number.isFinite(createdAtMs) && createdAtMs <= endMs);
	}).sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
}
function toStringArray(value) {
	if (!Array.isArray(value) || value.length === 0) return void 0;
	const normalized = value.filter((entry) => typeof entry === "string");
	return normalized.length > 0 ? normalized : void 0;
}
function toSharedPlatforms(value) {
	if (!Array.isArray(value) || value.length === 0) return void 0;
	const normalized = value.filter((entry) => entry === "email");
	return normalized.length > 0 ? normalized : void 0;
}
function toChannelType(value, fallback) {
	if (value === "client" || value === "team" || value === "project") return value;
	return fallback;
}
function previewPendingAttachmentToCollaborationAttachment(attachment) {
	return {
		name: attachment.name,
		url: "#",
		type: attachment.mimeType,
		size: attachment.sizeLabel
	};
}
function mapCollaborationMessageRow(row, { fallbackChannelType, fallbackClientId = null, fallbackProjectId = null, fallbackSenderId = null, fallbackSenderName = "Unknown teammate", fallbackSenderRole = null, fallbackThreadRootId = null, fallbackCreatedAtIso = null }) {
	const item = row ?? {};
	const id = String(item.legacyId ?? "");
	if (!id) return null;
	return {
		id,
		channelType: toChannelType(item.channelType, fallbackChannelType),
		clientId: typeof item.clientId === "string" ? item.clientId : fallbackClientId,
		projectId: typeof item.projectId === "string" ? item.projectId : fallbackProjectId,
		senderId: typeof item.senderId === "string" ? item.senderId : fallbackSenderId,
		senderName: typeof item.senderName === "string" ? item.senderName : fallbackSenderName,
		senderRole: typeof item.senderRole === "string" ? item.senderRole : fallbackSenderRole,
		content: item.deleted || item.deletedAtMs ? "" : String(item.content ?? ""),
		createdAt: typeof item.createdAtMs === "number" ? new Date(item.createdAtMs).toISOString() : fallbackCreatedAtIso,
		updatedAt: typeof item.updatedAtMs === "number" ? new Date(item.updatedAtMs).toISOString() : null,
		isEdited: Boolean(item.updatedAtMs && item.createdAtMs && item.updatedAtMs !== item.createdAtMs),
		deletedAt: typeof item.deletedAtMs === "number" ? new Date(item.deletedAtMs).toISOString() : null,
		deletedBy: typeof item.deletedBy === "string" ? item.deletedBy : null,
		isDeleted: Boolean(item.deleted || item.deletedAtMs),
		attachments: Array.isArray(item.attachments) && item.attachments.length > 0 ? item.attachments : void 0,
		format: item.format === "plaintext" ? "plaintext" : "markdown",
		mentions: Array.isArray(item.mentions) && item.mentions.length > 0 ? item.mentions : void 0,
		reactions: Array.isArray(item.reactions) && item.reactions.length > 0 ? item.reactions : void 0,
		readBy: toStringArray(item.readBy),
		deliveredTo: toStringArray(item.deliveredTo),
		isPinned: Boolean(item.isPinned),
		pinnedAt: typeof item.pinnedAtMs === "number" ? new Date(item.pinnedAtMs).toISOString() : null,
		pinnedBy: typeof item.pinnedBy === "string" ? item.pinnedBy : null,
		sharedTo: toSharedPlatforms(item.sharedTo),
		parentMessageId: typeof item.parentMessageId === "string" ? item.parentMessageId : null,
		threadRootId: typeof item.threadRootId === "string" ? item.threadRootId : fallbackThreadRootId,
		threadReplyCount: typeof item.threadReplyCount === "number" ? item.threadReplyCount : void 0,
		threadLastReplyAt: typeof item.threadLastReplyAtMs === "number" ? new Date(item.threadLastReplyAtMs).toISOString() : null
	};
}
function useChannelMessageSearch({ convex, workspaceId, selectedChannel, channelMessages, messagesByChannel, messageSearchQuery, isPreviewMode }) {
	const [asyncSearch, setAsyncSearch] = (0, import_react.useState)({
		results: [],
		highlights: [],
		searching: false,
		error: null
	});
	const [searchRetryNonce, setSearchRetryNonce] = (0, import_react.useState)(0);
	const retrySearch = () => {
		setSearchRetryNonce((n) => n + 1);
	};
	const normalizedMessageSearch = messageSearchQuery.trim();
	const parsedSearch = parseChannelMessageSearchQuery(normalizedMessageSearch);
	const resolvedSyncSearch = (() => {
		if (!selectedChannel || !normalizedMessageSearch) return {
			results: [],
			highlights: [],
			searching: false,
			error: null
		};
		if (isPreviewMode) return {
			results: filterChannelMessagesForSearch(messagesByChannel[selectedChannel.id] ?? [], parsedSearch),
			highlights: parsedSearch.highlights,
			searching: false,
			error: null
		};
		return null;
	})();
	const { results: searchResults, highlights: searchHighlights, searching: searchingMessages, error: searchError } = resolvedSyncSearch ?? asyncSearch;
	const fetchChannelMessageSearch = (0, import_react.useEffectEvent)(async (isCancelled) => {
		if (!selectedChannel || !normalizedMessageSearch) return;
		const startMs = parsedSearch.start ? Date.parse(parsedSearch.start) : NaN;
		const endMs = parsedSearch.end ? Date.parse(parsedSearch.end) : NaN;
		setAsyncSearch((prev) => ({
			...prev,
			searching: true,
			error: null
		}));
		if (isCancelled()) return;
		try {
			const payload = await convex.query(collaborationApi.searchChannel, {
				workspaceId: String(workspaceId),
				channelId: selectedChannel.isCustom ? selectedChannel.id : null,
				channelType: selectedChannel.type,
				clientId: selectedChannel.type === "client" ? selectedChannel.clientId ?? null : null,
				projectId: selectedChannel.type === "project" ? selectedChannel.projectId ?? null : null,
				q: parsedSearch.q || null,
				sender: parsedSearch.sender ?? null,
				attachment: parsedSearch.attachment ?? null,
				mention: parsedSearch.mention ?? null,
				startMs: Number.isFinite(startMs) ? startMs : null,
				endMs: Number.isFinite(endMs) ? endMs : null,
				limit: 200
			});
			if (isCancelled()) return;
			const resolvedPayload = payload ?? {};
			const rows = Array.isArray(resolvedPayload.rows) ? resolvedPayload.rows : [];
			const highlights = Array.isArray(resolvedPayload.highlights) ? resolvedPayload.highlights.filter((entry) => typeof entry === "string") : parsedSearch.highlights;
			setAsyncSearch({
				results: rows.flatMap((row) => {
					const message = mapCollaborationMessageRow(row, { fallbackChannelType: selectedChannel.type });
					return message ? [message] : [];
				}).sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()),
				highlights,
				searching: false,
				error: null
			});
		} catch (error) {
			if (isCancelled()) return;
			logError(error, "useCollaborationData:searchChannel");
			setAsyncSearch({
				results: [],
				highlights: parsedSearch.highlights,
				searching: false,
				error: asErrorMessage(error)
			});
		}
	});
	(0, import_react.useEffect)(() => {
		if (resolvedSyncSearch !== null) return;
		let cancelled = false;
		fetchChannelMessageSearch(() => cancelled);
		return () => {
			cancelled = true;
		};
	}, [
		normalizedMessageSearch,
		resolvedSyncSearch,
		searchRetryNonce,
		selectedChannel?.id,
		workspaceId
	]);
	return {
		normalizedMessageSearch,
		visibleMessages: (() => {
			if (normalizedMessageSearch) {
				if (searchResults.length > 0) return searchResults;
				if (searchingMessages) return searchResults;
				if (searchError) return [];
				return searchResults;
			}
			return channelMessages;
		})(),
		searchingMessages,
		searchHighlights,
		searchError,
		retrySearch
	};
}
function useMessageActions({ workspaceId, userId, isPreviewMode, channels, channelParticipants, mutateChannelMessages, mutateThreadMessageById }) {
	const updateMessage = useMutation(collaborationApi.updateMessage);
	const softDeleteMessage = useMutation(collaborationApi.softDeleteMessage);
	const toggleReaction = useMutation(collaborationApi.toggleReaction);
	const [messageUpdatingId, setMessageUpdatingId] = (0, import_react.useState)(null);
	const [messageDeletingId, setMessageDeletingId] = (0, import_react.useState)(null);
	const [reactionUpdatingByMessage, setReactionUpdatingByMessage] = (0, import_react.useState)({});
	const applyMessageUpdate = (channelId, messageId, updater) => {
		mutateChannelMessages(channelId, (messages) => {
			const index = messages.findIndex((entry) => entry.id === messageId);
			if (index === -1) return messages;
			const currentMessage = messages[index];
			if (!currentMessage) return messages;
			const updatedMessage = updater(currentMessage);
			if (updatedMessage === currentMessage) return messages;
			const next = [...messages];
			next[index] = updatedMessage;
			return next;
		});
		mutateThreadMessageById?.(messageId, updater);
	};
	const handleToggleReaction = async (channelId, messageId, emoji) => {
		if (!channels.some((channel) => channel.id === channelId)) {
			notifyFailure({
				title: "Channel unavailable",
				message: "Refresh and try reacting again."
			});
			return;
		}
		if (!COLLABORATION_REACTION_SET.has(emoji)) {
			notifyFailure({
				title: "Reaction unavailable",
				message: "That emoji is not supported for reactions."
			});
			return;
		}
		setReactionUpdatingByMessage((prev) => ({
			...prev,
			[messageId]: emoji
		}));
		try {
			if (isPreviewMode) {
				const reactionUserId = userId ?? "preview-current-user";
				applyMessageUpdate(channelId, messageId, (currentMessage) => {
					const currentReactions = currentMessage.reactions ?? [];
					const existingReaction = currentReactions.find((reaction) => reaction.emoji === emoji);
					let nextReactions;
					if (existingReaction) {
						const hasReacted = existingReaction.userIds.includes(reactionUserId);
						nextReactions = currentReactions.flatMap((reaction) => {
							if (reaction.emoji !== emoji) return [reaction];
							const nextUserIds = hasReacted ? reaction.userIds.filter((entry) => entry !== reactionUserId) : [...reaction.userIds, reactionUserId];
							if (nextUserIds.length === 0) return [];
							return [{
								...reaction,
								count: nextUserIds.length,
								userIds: nextUserIds
							}];
						});
					} else nextReactions = [...currentReactions, {
						emoji,
						count: 1,
						userIds: [reactionUserId]
					}];
					return {
						...currentMessage,
						reactions: nextReactions
					};
				});
				return;
			}
			if (!workspaceId) throw new Error("Workspace unavailable");
			if (!userId) throw new Error("You must be signed in to react");
			const result = await toggleReaction({
				workspaceId: String(workspaceId),
				legacyId: messageId,
				emoji,
				userId: String(userId)
			});
			const reactions = Array.isArray(result?.reactions) ? result.reactions : [];
			applyMessageUpdate(channelId, messageId, (currentMessage) => ({
				...currentMessage,
				reactions
			}));
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useMessageActions:handleToggleReaction",
				title: "Reaction failed",
				fallbackMessage: "Reaction failed"
			});
			throw error;
		} finally {
			setReactionUpdatingByMessage((prev) => {
				const next = { ...prev };
				if (next[messageId] === emoji) delete next[messageId];
				return next;
			});
		}
	};
	const handleEditMessage = async (channelId, messageId, nextContent) => {
		const trimmedContent = nextContent.trim();
		if (!trimmedContent) {
			notifyFailure({
				title: "Message required",
				message: "Enter a message before saving."
			});
			return;
		}
		if (!channels.some((channel) => channel.id === channelId)) {
			notifyFailure({
				title: "Channel unavailable",
				message: "Refresh the page and try editing again."
			});
			return;
		}
		setMessageUpdatingId(messageId);
		try {
			const mentionMetadata = extractMentionsFromContent(trimmedContent).map((mention) => {
				const participant = channelParticipants.find((member) => member.name.toLowerCase() === mention.name.toLowerCase());
				return {
					slug: mention.slug,
					name: participant?.name ?? mention.name,
					role: participant?.role ?? null
				};
			});
			if (isPreviewMode) {
				applyMessageUpdate(channelId, messageId, (currentMessage) => ({
					...currentMessage,
					content: trimmedContent,
					format: "markdown",
					mentions: mentionMetadata,
					updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
					isEdited: true
				}));
				notifyInfo({
					title: "Preview message updated",
					message: "Changes apply only in sample mode."
				});
				return;
			}
			if (!workspaceId) throw new Error("Workspace unavailable");
			if (!userId) throw new Error("You must be signed in to edit messages");
			await updateMessage({
				workspaceId: String(workspaceId),
				legacyId: messageId,
				content: trimmedContent,
				format: "markdown",
				mentions: mentionMetadata
			});
			const updatedMessage = {
				id: messageId,
				channelType: channels.find((c) => c.id === channelId)?.type ?? "team",
				clientId: null,
				projectId: null,
				senderId: null,
				senderName: "Unknown teammate",
				senderRole: null,
				content: trimmedContent,
				createdAt: null,
				updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
				isEdited: true,
				deletedAt: null,
				deletedBy: null,
				isDeleted: false,
				attachments: void 0,
				format: "markdown",
				mentions: mentionMetadata,
				reactions: [],
				parentMessageId: null,
				threadRootId: null
			};
			applyMessageUpdate(channelId, messageId, (currentMessage) => ({
				...currentMessage,
				...updatedMessage,
				mentions: updatedMessage.mentions ?? mentionMetadata,
				format: updatedMessage.format ?? "markdown"
			}));
			notifySuccess({
				title: "Message updated",
				message: "Your edit is live for the team."
			});
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useMessageActions:handleEditMessage",
				title: "Collaboration error",
				fallbackMessage: "Collaboration error"
			});
			throw error;
		} finally {
			setMessageUpdatingId((current) => current === messageId ? null : current);
		}
	};
	const handleDeleteMessage = async (channelId, messageId) => {
		if (!channels.some((channel) => channel.id === channelId)) {
			notifyFailure({
				title: "Channel unavailable",
				message: "Refresh and try deleting again."
			});
			return;
		}
		setMessageDeletingId(messageId);
		try {
			if (isPreviewMode) {
				applyMessageUpdate(channelId, messageId, (currentMessage) => ({
					...currentMessage,
					content: "",
					isDeleted: true,
					deletedAt: (/* @__PURE__ */ new Date()).toISOString(),
					deletedBy: userId ?? "preview-current-user",
					attachments: [],
					reactions: []
				}));
				notifyInfo({
					title: "Preview message removed",
					message: "This only changes the sample conversation."
				});
				return;
			}
			if (!workspaceId) throw new Error("Workspace unavailable");
			if (!userId) throw new Error("You must be signed in to delete messages");
			await softDeleteMessage({
				workspaceId: String(workspaceId),
				legacyId: messageId,
				deletedBy: String(userId)
			});
			const deletedMessage = {
				id: messageId,
				channelType: channels.find((c) => c.id === channelId)?.type ?? "team",
				clientId: null,
				projectId: null,
				senderId: null,
				senderName: "Unknown teammate",
				senderRole: null,
				content: "",
				createdAt: null,
				updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
				isEdited: false,
				deletedAt: (/* @__PURE__ */ new Date()).toISOString(),
				deletedBy: String(userId),
				isDeleted: true,
				attachments: [],
				format: "markdown",
				mentions: void 0,
				reactions: [],
				parentMessageId: null,
				threadRootId: null
			};
			applyMessageUpdate(channelId, messageId, (currentMessage) => ({
				...currentMessage,
				...deletedMessage,
				attachments: [],
				reactions: []
			}));
			notifySuccess({
				title: "Message removed",
				message: "The message is no longer visible to teammates."
			});
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useMessageActions:handleDeleteMessage",
				title: "Collaboration error",
				fallbackMessage: "Collaboration error"
			});
			throw error;
		} finally {
			setMessageDeletingId((current) => current === messageId ? null : current);
		}
	};
	const clearReactionState = () => {
		setReactionUpdatingByMessage({});
	};
	return {
		messageUpdatingId,
		messageDeletingId,
		reactionUpdatingByMessage,
		handleEditMessage,
		handleDeleteMessage,
		handleToggleReaction,
		clearReactionState
	};
}
var VALID_CHANNEL_TYPES$1 = [
	"client",
	"team",
	"project"
];
function isValidChannelType$1(value) {
	return typeof value === "string" && VALID_CHANNEL_TYPES$1.includes(value);
}
function mapConvexRealtimeMessageRow(row) {
	const isDeleted = Boolean(row?.deleted || row?.deletedAtMs);
	const createdAt = typeof row?.createdAtMs === "number" ? new Date(row.createdAtMs).toISOString() : null;
	const updatedAt = typeof row?.updatedAtMs === "number" ? new Date(row.updatedAtMs).toISOString() : null;
	const deletedAt = typeof row?.deletedAtMs === "number" ? new Date(row.deletedAtMs).toISOString() : null;
	const threadLastReplyAt = typeof row?.threadLastReplyAtMs === "number" ? new Date(row.threadLastReplyAtMs).toISOString() : null;
	const content = typeof row?.content === "string" ? row.content : "";
	return {
		id: String(row?.legacyId ?? ""),
		channelType: isValidChannelType$1(row?.channelType) ? row.channelType : "team",
		clientId: typeof row?.clientId === "string" ? row.clientId : null,
		projectId: typeof row?.projectId === "string" ? row.projectId : null,
		senderId: typeof row?.senderId === "string" ? row.senderId : null,
		senderName: typeof row?.senderName === "string" ? row.senderName : "Unknown teammate",
		senderRole: typeof row?.senderRole === "string" ? row.senderRole : null,
		content: isDeleted ? "" : content,
		createdAt,
		updatedAt,
		isEdited: Boolean(updatedAt && (!createdAt || createdAt !== updatedAt) && !isDeleted),
		deletedAt,
		deletedBy: typeof row?.deletedBy === "string" ? row.deletedBy : null,
		isDeleted,
		attachments: Array.isArray(row?.attachments) && row.attachments.length > 0 ? row.attachments : void 0,
		format: row?.format === "plaintext" ? "plaintext" : "markdown",
		mentions: Array.isArray(row?.mentions) && row.mentions.length > 0 ? row.mentions : void 0,
		reactions: Array.isArray(row?.reactions) && row.reactions.length > 0 ? row.reactions : void 0,
		readBy: Array.isArray(row?.readBy) && row.readBy.length > 0 ? row.readBy.filter((value) => typeof value === "string") : void 0,
		deliveredTo: Array.isArray(row?.deliveredTo) && row.deliveredTo.length > 0 ? row.deliveredTo.filter((value) => typeof value === "string") : void 0,
		isPinned: Boolean(row?.isPinned),
		pinnedAt: typeof row?.pinnedAtMs === "number" ? new Date(row.pinnedAtMs).toISOString() : null,
		pinnedBy: typeof row?.pinnedBy === "string" ? row.pinnedBy : null,
		sharedTo: Array.isArray(row?.sharedTo) && row.sharedTo.length > 0 ? row.sharedTo.filter((platform) => platform === "email") : void 0,
		parentMessageId: typeof row?.parentMessageId === "string" ? row.parentMessageId : null,
		threadRootId: typeof row?.threadRootId === "string" ? row.threadRootId : null,
		threadReplyCount: typeof row?.threadReplyCount === "number" ? row.threadReplyCount : void 0,
		threadLastReplyAt
	};
}
function useRealtimeChannelSnapshot({ workspaceId, selectedChannel, currentUserId, channelListRetryNonce }) {
	const { isPreviewMode } = usePreview();
	const channelId = selectedChannel?.id ?? null;
	const channelType = selectedChannel?.type ?? null;
	const channelClientId = selectedChannel?.clientId ?? null;
	const channelProjectId = selectedChannel?.projectId ?? null;
	const channelScopeId = selectedChannel?.isCustom ? selectedChannel.id : null;
	const convexEnabled = !isPreviewMode && Boolean(workspaceId) && Boolean(channelId) && Boolean(channelType);
	const channelListQueryId = `channelList:${channelId ?? "none"}:${channelListRetryNonce}`;
	const channelListQueries = (() => {
		if (!convexEnabled) return {};
		return { [channelListQueryId]: {
			query: collaborationApi.listChannel,
			args: {
				workspaceId: String(workspaceId),
				channelId: channelScopeId,
				channelType: String(channelType),
				clientId: channelType === "client" ? channelClientId ?? null : null,
				projectId: channelType === "project" ? channelProjectId ?? null : null,
				limit: 201
			}
		} };
	})();
	const channelListResults = useQueries(channelListQueries);
	const channelListResult = channelListQueries[channelListQueryId] ? channelListResults[channelListQueryId] : void 0;
	return (() => {
		if (!channelId || !channelType) return { kind: "idle" };
		if (isPreviewMode) return {
			kind: "preview",
			channelId,
			messages: getPreviewCollaborationMessages(channelType, channelClientId, channelProjectId, currentUserId)
		};
		if (!convexEnabled) return { kind: "idle" };
		if (channelListResult === void 0) return {
			kind: "loading",
			channelId
		};
		if (channelListResult instanceof Error) return {
			kind: "error",
			channelId,
			errorMessage: asErrorMessage(channelListResult)
		};
		const convexRows = channelListResult;
		const rows = Array.isArray(convexRows.items) ? convexRows.items : [];
		const hasMore = Boolean(convexRows.nextCursor);
		const pageRows = rows;
		const oldestRow = pageRows.length ? pageRows[pageRows.length - 1] : null;
		const nextCursor = hasMore && oldestRow && typeof oldestRow.createdAtMs === "number" ? encodeTimestampIdCursor(new Date(oldestRow.createdAtMs).toISOString(), String(oldestRow.legacyId ?? "")) : null;
		return {
			kind: "success",
			channelId,
			messages: pageRows.flatMap((row) => {
				const message = mapConvexRealtimeMessageRow(row);
				return message.id ? [message] : [];
			}).sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()),
			nextCursor
		};
	})();
}
function useRealtimeTyping({ userId, workspaceId, selectedChannel = null, conversationLegacyId = null }) {
	const { isPreviewMode } = usePreview();
	const channelId = conversationLegacyId ? `dm:${conversationLegacyId}` : selectedChannel?.id ?? null;
	const convexEnabled = !isPreviewMode && Boolean(userId) && Boolean(workspaceId) && Boolean(channelId);
	const typingRows = useQuery(collaborationApi.listTyping, convexEnabled ? {
		workspaceId: String(workspaceId),
		channelId: String(channelId),
		limit: 20
	} : "skip");
	return { typingParticipants: (() => {
		if (!convexEnabled || !typingRows) return [];
		return typingRows.flatMap((row) => {
			if (typeof row?.userId !== "string" || row.userId === userId) return [];
			const name = typeof row?.name === "string" ? row.name : null;
			if (!name || name.trim().length === 0) return [];
			return [{
				name,
				role: typeof row?.role === "string" ? row.role : null
			}];
		});
	})() };
}
var VALID_CHANNEL_TYPES = [
	"client",
	"team",
	"project"
];
function isValidChannelType(value) {
	return typeof value === "string" && VALID_CHANNEL_TYPES.includes(value);
}
function mapThreadReplyRow(row) {
	const readBy = Array.isArray(row?.readBy) ? row.readBy.filter((entry) => typeof entry === "string") : [];
	const deliveredTo = Array.isArray(row?.deliveredTo) ? row.deliveredTo.filter((entry) => typeof entry === "string") : [];
	const sharedTo = Array.isArray(row?.sharedTo) ? row.sharedTo.filter((entry) => entry === "email") : [];
	return {
		id: String(row?.legacyId ?? ""),
		channelType: isValidChannelType(row?.channelType) ? row.channelType : "team",
		clientId: typeof row?.clientId === "string" ? row.clientId : null,
		projectId: typeof row?.projectId === "string" ? row.projectId : null,
		senderId: typeof row?.senderId === "string" ? row.senderId : null,
		senderName: typeof row?.senderName === "string" ? row.senderName : "Unknown teammate",
		senderRole: typeof row?.senderRole === "string" ? row.senderRole : null,
		content: row?.deleted || row?.deletedAtMs ? "" : String(row?.content ?? ""),
		createdAt: typeof row?.createdAtMs === "number" ? new Date(row.createdAtMs).toISOString() : null,
		updatedAt: typeof row?.updatedAtMs === "number" ? new Date(row.updatedAtMs).toISOString() : null,
		isEdited: Boolean(row?.updatedAtMs && row?.createdAtMs && row.updatedAtMs !== row.createdAtMs),
		deletedAt: typeof row?.deletedAtMs === "number" ? new Date(row.deletedAtMs).toISOString() : null,
		deletedBy: typeof row?.deletedBy === "string" ? row.deletedBy : null,
		isDeleted: Boolean(row?.deleted || row?.deletedAtMs),
		attachments: Array.isArray(row?.attachments) && row.attachments.length > 0 ? row.attachments : void 0,
		format: row?.format === "plaintext" ? "plaintext" : "markdown",
		mentions: Array.isArray(row?.mentions) && row.mentions.length > 0 ? row.mentions : void 0,
		reactions: Array.isArray(row?.reactions) && row.reactions.length > 0 ? row.reactions : void 0,
		parentMessageId: typeof row?.parentMessageId === "string" ? row.parentMessageId : null,
		threadRootId: typeof row?.threadRootId === "string" ? row.threadRootId : null,
		threadReplyCount: typeof row?.threadReplyCount === "number" ? row.threadReplyCount : void 0,
		threadLastReplyAt: typeof row?.threadLastReplyAtMs === "number" ? new Date(row.threadLastReplyAtMs).toISOString() : null,
		readBy,
		deliveredTo,
		isPinned: Boolean(row?.isPinned),
		pinnedAt: typeof row?.pinnedAtMs === "number" ? new Date(row.pinnedAtMs).toISOString() : null,
		pinnedBy: typeof row?.pinnedBy === "string" ? row.pinnedBy : null,
		sharedTo
	};
}
function useThreads({ workspaceId, currentUserId }) {
	const { isPreviewMode } = usePreview();
	const convex = useConvex();
	const queryClient = useQueryClient();
	const [activeThreadIds, setActiveThreadIds] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [threadErrorsByRootId, setThreadErrorsByRootId] = (0, import_react.useState)({});
	const [threadMessagesByRootId, setThreadMessagesByRootId] = (0, import_react.useState)({});
	const [threadNextCursorByRootId, setThreadNextCursorByRootId] = (0, import_react.useState)({});
	const [threadLoadingByRootId, setThreadLoadingByRootId] = (0, import_react.useState)({});
	const fetchThreadRepliesPage = async (threadRootId, cursor) => {
		if (isPreviewMode) return {
			replies: cursor ? [] : getPreviewCollaborationThreadReplies(threadRootId, currentUserId),
			nextCursor: null
		};
		if (!workspaceId) return {
			replies: [],
			nextCursor: null
		};
		const decoded = decodeTimestampIdCursor(cursor);
		const rows = (await convex.query(collaborationApi.listThreadReplies, {
			workspaceId: String(workspaceId),
			threadRootId,
			limit: 51,
			cursor: decoded ? {
				legacyId: decoded.id,
				fieldValue: decoded.time.getTime()
			} : void 0
		})).items;
		const mapped = rows.slice(0, 50).flatMap((row) => {
			const message = mapThreadReplyRow(row);
			return message.id ? [message] : [];
		}).sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()).map((message) => ({
			...message,
			reactions: message.reactions ?? []
		}));
		const hasMore = rows.length > 50;
		const lastDisplayed = rows.length ? rows[Math.min(rows.length, 50) - 1] : null;
		return {
			replies: mapped,
			nextCursor: hasMore && lastDisplayed && typeof lastDisplayed.createdAtMs === "number" ? encodeTimestampIdCursor(new Date(lastDisplayed.createdAtMs).toISOString(), String(lastDisplayed.legacyId ?? "")) : null
		};
	};
	(0, import_react.useEffect)(() => {
		const activeIds = new Set(activeThreadIds);
		setThreadMessagesByRootId((prev) => {
			const next = { ...prev };
			for (const key of Object.keys(next)) if (!activeIds.has(key)) delete next[key];
			return next;
		});
		setThreadNextCursorByRootId((prev) => {
			const next = { ...prev };
			for (const key of Object.keys(next)) if (!activeIds.has(key)) delete next[key];
			return next;
		});
		setThreadLoadingByRootId((prev) => {
			const next = { ...prev };
			for (const key of Object.keys(next)) if (!activeIds.has(key)) delete next[key];
			return next;
		});
	}, [activeThreadIds]);
	const loadThreadReplies = async (threadRootId) => {
		const trimmedId = threadRootId.trim();
		if (!trimmedId) return;
		setActiveThreadIds((prev) => {
			const next = new Set(prev);
			next.add(trimmedId);
			return next;
		});
		setThreadErrorsByRootId((prev) => ({
			...prev,
			[trimmedId]: null
		}));
		setThreadLoadingByRootId((prev) => ({
			...prev,
			[trimmedId]: true
		}));
		try {
			const firstPage = await fetchThreadRepliesPage(trimmedId, null);
			setThreadMessagesByRootId((prev) => ({
				...prev,
				[trimmedId]: firstPage.replies
			}));
			setThreadNextCursorByRootId((prev) => ({
				...prev,
				[trimmedId]: firstPage.nextCursor
			}));
		} catch (error) {
			logError(error, "useThreads:loadThreadReplies");
			const message = asErrorMessage(error);
			setThreadErrorsByRootId((prev) => ({
				...prev,
				[trimmedId]: message
			}));
			notifyFailure({
				title: "Thread loading failed",
				message
			});
		} finally {
			setThreadLoadingByRootId((prev) => ({
				...prev,
				[trimmedId]: false
			}));
		}
	};
	const loadMoreThreadReplies = async (threadRootId) => {
		const trimmedId = threadRootId.trim();
		if (!trimmedId) return;
		const cursor = threadNextCursorByRootId[trimmedId] ?? null;
		const isLoading = threadLoadingByRootId[trimmedId] ?? false;
		if (!cursor || isLoading) return;
		setThreadLoadingByRootId((prev) => ({
			...prev,
			[trimmedId]: true
		}));
		try {
			const page = await fetchThreadRepliesPage(trimmedId, cursor);
			setThreadMessagesByRootId((prev) => {
				const existing = prev[trimmedId] ?? [];
				return {
					...prev,
					[trimmedId]: [...existing, ...page.replies]
				};
			});
			setThreadNextCursorByRootId((prev) => ({
				...prev,
				[trimmedId]: page.nextCursor
			}));
		} catch (error) {
			logError(error, "useThreads:loadMoreThreadReplies");
			const message = asErrorMessage(error);
			setThreadErrorsByRootId((prev) => ({
				...prev,
				[trimmedId]: message
			}));
			notifyFailure({
				title: "Thread loading failed",
				message
			});
		} finally {
			setThreadLoadingByRootId((prev) => ({
				...prev,
				[trimmedId]: false
			}));
		}
	};
	const clearThreadReplies = (threadRootId) => {
		if (!threadRootId) {
			setActiveThreadIds(/* @__PURE__ */ new Set());
			setThreadErrorsByRootId({});
			return;
		}
		const trimmedId = threadRootId.trim();
		if (!trimmedId) return;
		setActiveThreadIds((prev) => {
			if (!prev.has(trimmedId)) return prev;
			const next = new Set(prev);
			next.delete(trimmedId);
			return next;
		});
		setThreadErrorsByRootId((prev) => {
			if (!(trimmedId in prev)) return prev;
			const next = { ...prev };
			delete next[trimmedId];
			return next;
		});
		queryClient.removeQueries({ queryKey: [
			"threadReplies",
			workspaceId,
			trimmedId
		] });
	};
	const addThreadReply = (rootId, message) => {
		queryClient.setQueryData([
			"threadReplies",
			workspaceId,
			rootId
		], (existing) => {
			if (!existing || typeof existing !== "object") return existing;
			const data = existing;
			if (!Array.isArray(data.pages) || data.pages.length === 0) return existing;
			const pages = [...data.pages];
			const lastPageIndex = pages.length - 1;
			const lastPage = pages[lastPageIndex];
			if (!lastPage) return existing;
			const currentReplies = lastPage?.replies ?? [];
			if (currentReplies.some((entry) => entry.id === message.id)) return existing;
			pages[lastPageIndex] = {
				...lastPage,
				replies: [...currentReplies, message]
			};
			return {
				...data,
				pages
			};
		});
	};
	const addThreadReplyToState = (rootId, message) => {
		const trimmedRootId = rootId.trim();
		if (!trimmedRootId || !message.id) return;
		setThreadMessagesByRootId((prev) => {
			const existing = prev[trimmedRootId] ?? [];
			if (existing.some((m) => m.id === message.id)) return prev;
			const updated = [...existing, message].sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());
			return {
				...prev,
				[trimmedRootId]: updated
			};
		});
	};
	const mutateThreadMessageById = (messageId, updater) => {
		const trimmedMessageId = messageId.trim();
		if (!trimmedMessageId) return;
		setThreadMessagesByRootId((prev) => {
			let changed = false;
			const nextEntries = Object.entries(prev).map(([threadRootId, replies]) => {
				const replyIndex = replies.findIndex((message) => message.id === trimmedMessageId);
				if (replyIndex === -1) return [threadRootId, replies];
				const currentReply = replies[replyIndex];
				if (!currentReply) return [threadRootId, replies];
				const updatedReply = updater(currentReply);
				if (updatedReply === currentReply) return [threadRootId, replies];
				changed = true;
				const nextReplies = [...replies];
				nextReplies[replyIndex] = updatedReply;
				return [threadRootId, nextReplies];
			});
			if (!changed) return prev;
			return Object.fromEntries(nextEntries);
		});
	};
	return {
		threadMessagesByRootId,
		threadNextCursorByRootId,
		threadLoadingByRootId,
		threadErrorsByRootId,
		loadThreadReplies,
		loadMoreThreadReplies,
		clearThreadReplies,
		addThreadReply,
		addThreadReplyToState,
		mutateThreadMessageById
	};
}
var DM_TYPING_CHANNEL_PREFIX = "dm:";
function buildDmTypingChannelId(conversationLegacyId) {
	return `${DM_TYPING_CHANNEL_PREFIX}${conversationLegacyId}`;
}
function buildTypingUpdateRequest({ workspaceId, selectedChannel, conversationLegacyId, senderName, senderRole, isTyping }) {
	if (!workspaceId || !senderName) return null;
	if (conversationLegacyId) return {
		workspaceId,
		channelId: buildDmTypingChannelId(conversationLegacyId),
		channelType: "direct_message",
		clientId: null,
		projectId: null,
		name: senderName,
		role: senderRole,
		isTyping,
		ttlMs: TYPING_TIMEOUT_MS
	};
	if (!selectedChannel) return null;
	return {
		workspaceId,
		channelId: selectedChannel.id,
		channelType: selectedChannel.type,
		clientId: selectedChannel.clientId ?? null,
		projectId: selectedChannel.projectId ?? null,
		name: senderName,
		role: senderRole,
		isTyping,
		ttlMs: TYPING_TIMEOUT_MS
	};
}
function useTyping({ workspaceId, selectedChannel = null, conversationLegacyId = null, resolveSenderDetails }) {
	const { isPreviewMode } = usePreview();
	const typingTargetId = conversationLegacyId ?? selectedChannel?.id ?? null;
	const composerFocusedRef = (0, import_react.useRef)(false);
	const isTypingRef = (0, import_react.useRef)(false);
	const lastTypingUpdateRef = (0, import_react.useRef)(0);
	const typingTimeoutRef = (0, import_react.useRef)(null);
	const setTyping = useMutation(collaborationApi.setTyping);
	const sendTypingUpdate = async (isTyping) => {
		if (isPreviewMode) return;
		const { senderName, senderRole } = resolveSenderDetails();
		const request = buildTypingUpdateRequest({
			workspaceId,
			selectedChannel,
			conversationLegacyId,
			senderName,
			senderRole,
			isTyping
		});
		if (!request) return;
		try {
			await setTyping(request);
		} catch (error) {
			logError(error, "useTyping:sendTypingUpdate");
		}
	};
	const stopTyping = (0, import_react.useEffectEvent)(() => {
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
			typingTimeoutRef.current = null;
		}
		if (!isTypingRef.current) return;
		isTypingRef.current = false;
		lastTypingUpdateRef.current = 0;
		sendTypingUpdate(false);
	});
	const notifyTyping = () => {
		if (!composerFocusedRef.current || !typingTargetId) return;
		const now = Date.now();
		if (!isTypingRef.current || now - lastTypingUpdateRef.current > 2500) {
			isTypingRef.current = true;
			lastTypingUpdateRef.current = now;
			sendTypingUpdate(true);
		}
		if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
		typingTimeoutRef.current = setTimeout(() => {
			isTypingRef.current = false;
			lastTypingUpdateRef.current = 0;
			sendTypingUpdate(false);
		}, TYPING_TIMEOUT_MS);
	};
	const handleComposerFocus = () => {
		composerFocusedRef.current = true;
	};
	const handleComposerBlur = () => {
		composerFocusedRef.current = false;
		stopTyping();
	};
	(0, import_react.useEffect)(() => {
		if (typingTargetId === null) return () => {
			stopTyping();
		};
		return () => {
			stopTyping();
		};
	}, [typingTargetId]);
	(0, import_react.useEffect)(() => {
		const handleBeforeUnload = () => {
			stopTyping();
		};
		const handleVisibilityChange = () => {
			if (document.visibilityState === "hidden") stopTyping();
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, []);
	return {
		composerFocusedRef,
		stopTyping,
		notifyTyping,
		handleComposerFocus,
		handleComposerBlur
	};
}
/** Sends collaboration message copies to external channels (email) per notification prefs V2. */
function useCollaborationExternalNotify() {
	const convex = useConvex();
	const updateSharedTo = useMutation(collaborationApi.updateSharedTo);
	const sendCollaborationEmailCopy = async (message, workspaceId) => {
		try {
			const rawPrefs = await convex.query(api$1.settings.getMyNotificationPreferences, {});
			if (!rawPrefs) return;
			if (!shouldSendCollaborationEmailCopy(rawPrefs)) return;
			try {
				const response = await fetch("/api/integrations/email/send", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						messageType: "collaboration",
						text: message.content,
						metadata: {
							senderName: message.senderName,
							conversationUrl: `${window.location.origin}/dashboard/collaboration`
						}
					})
				});
				if (!response.ok) {
					notifyFailure({
						title: "Email collaboration copy failed",
						message: typeof response.status === "number" ? `Server returned ${response.status}.` : "Request failed."
					});
					return;
				}
				try {
					await updateSharedTo({
						workspaceId,
						legacyId: message.id,
						sharedTo: ["email"]
					});
				} catch (error) {
					reportConvexFailure({
						error,
						context: "useCollaborationExternalNotify:updateSharedTo",
						title: "Could not tag message as emailed",
						fallbackMessage: "Could not tag message as emailed"
					});
				}
			} catch (error) {
				reportConvexFailure({
					error,
					context: "useCollaborationExternalNotify:email",
					title: "Email collaboration copy failed",
					fallbackMessage: "Email collaboration copy failed"
				});
			}
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useCollaborationExternalNotify",
				title: "Collaboration email unavailable",
				fallbackMessage: "Collaboration email unavailable"
			});
		}
	};
	return { sendCollaborationEmailCopy };
}
function useChannelMessageSend({ workspaceId, currentUserId, selectedChannel, channels, channelMessages, channelParticipants, fallbackDisplayName, fallbackRole, messageInput, setMessageInput, pendingAttachments, uploading, clearAttachments, uploadAttachments, isPreviewMode, stopTyping, mutateChannelMessages, addThreadReplyToState, sendToExternalPlatforms }) {
	const convex = useConvex();
	const createMessage = useMutation(collaborationApi.createMessage);
	const [sending, setSending] = (0, import_react.useState)(false);
	const previewReplyTimersRef = (0, import_react.useRef)([]);
	const participantNameMap = new Map(channelParticipants.map((participant) => [participant.name.toLowerCase(), participant]));
	const resolveSenderDetails = () => {
		return {
			senderName: fallbackDisplayName,
			senderRole: participantNameMap.get(fallbackDisplayName.toLowerCase())?.role ?? fallbackRole
		};
	};
	const isSendDisabled = (() => {
		if (sending || uploading) return true;
		const hasContent = messageInput.trim().length > 0;
		const hasAttachments = pendingAttachments.length > 0;
		return !hasContent && !hasAttachments;
	})();
	const schedulePreviewAutoReply = (params) => {
		if (typeof window === "undefined") return;
		const timerId = window.setTimeout(() => {
			previewReplyTimersRef.current = previewReplyTimersRef.current.filter((id) => id !== timerId);
			const reply = getPreviewCollaborationAutoReply({
				channelType: params.channelType,
				clientId: params.clientId,
				projectId: params.projectId,
				content: params.content,
				viewerId: currentUserId,
				parentMessageId: params.parentMessageId ?? null,
				threadRootId: params.threadRootId ?? null
			});
			mutateChannelMessages(params.channelId, (messages) => {
				if (reply.parentMessageId && reply.threadRootId) return messages.map((message) => {
					if (message.id !== reply.threadRootId) return message;
					return {
						...message,
						threadReplyCount: (message.threadReplyCount ?? 0) + 1,
						threadLastReplyAt: reply.createdAt
					};
				});
				return [...messages, reply];
			});
			if (reply.threadRootId) addThreadReplyToState(reply.threadRootId, reply);
		}, 900);
		previewReplyTimersRef.current.push(timerId);
	};
	const handleSendMessage = async (options) => {
		const trimmedContent = (options?.content ?? messageInput).trim();
		const channelId = selectedChannel?.id;
		if (!trimmedContent && pendingAttachments.length === 0) {
			notifyFailure({
				title: "Message required",
				message: "Enter a message before sending."
			});
			return;
		}
		if (!channelId || !channels.some((c) => c.id === channelId)) {
			notifyFailure({
				title: "Channel unavailable",
				message: "Select a channel and try again."
			});
			return;
		}
		setSending(true);
		try {
			await stopTyping();
			const senderDetails = resolveSenderDetails();
			const uploadedAttachments = isPreviewMode ? pendingAttachments.map(previewPendingAttachmentToCollaborationAttachment) : await uploadAttachments(pendingAttachments);
			const mentionMetadata = extractMentionsFromContent(trimmedContent).map((mention) => {
				const participant = participantNameMap.get(mention.name.toLowerCase());
				return {
					slug: mention.slug,
					name: participant?.name ?? mention.name,
					role: participant?.role ?? null
				};
			});
			if (!currentUserId || !isPreviewMode && !workspaceId || !selectedChannel) return;
			const parentMessage = options?.parentMessageId ? channelMessages.find((message) => message.id === options.parentMessageId) : null;
			const resolvedThreadRootId = options?.parentMessageId ? parentMessage?.threadRootId || parentMessage?.id || options.parentMessageId : null;
			if (isPreviewMode) {
				const createdMessage = {
					id: v4(),
					channelType: selectedChannel.type,
					clientId: selectedChannel.clientId ?? null,
					projectId: selectedChannel.projectId ?? null,
					senderId: String(currentUserId),
					senderName: senderDetails.senderName,
					senderRole: senderDetails.senderRole,
					content: trimmedContent,
					createdAt: (/* @__PURE__ */ new Date()).toISOString(),
					updatedAt: null,
					isEdited: false,
					deletedAt: null,
					deletedBy: null,
					isDeleted: false,
					attachments: uploadedAttachments.length > 0 ? uploadedAttachments : void 0,
					format: "markdown",
					mentions: mentionMetadata.length > 0 ? mentionMetadata : void 0,
					reactions: [],
					readBy: [String(currentUserId)],
					deliveredTo: [String(currentUserId)],
					isPinned: false,
					pinnedAt: null,
					pinnedBy: null,
					sharedTo: void 0,
					parentMessageId: options?.parentMessageId ?? null,
					threadRootId: resolvedThreadRootId,
					threadReplyCount: void 0,
					threadLastReplyAt: null
				};
				mutateChannelMessages(channelId, (messages) => {
					if (createdMessage.parentMessageId) return messages.map((message) => {
						if (message.id !== resolvedThreadRootId) return message;
						return {
							...message,
							threadReplyCount: (message.threadReplyCount ?? 0) + 1,
							threadLastReplyAt: createdMessage.createdAt
						};
					});
					return [...messages, createdMessage];
				});
				if (resolvedThreadRootId) addThreadReplyToState(resolvedThreadRootId, createdMessage);
				schedulePreviewAutoReply({
					channelId,
					channelType: selectedChannel.type,
					clientId: selectedChannel.clientId ?? null,
					projectId: selectedChannel.projectId ?? null,
					content: trimmedContent,
					parentMessageId: options?.parentMessageId ? createdMessage.id : null,
					threadRootId: resolvedThreadRootId
				});
				clearAttachments();
				setMessageInput("");
				notifyInfo({
					title: "Preview message sent",
					message: "This only updates the sample collaboration feed."
				});
				return;
			}
			const messageId = v4();
			await createMessage({
				workspaceId: String(workspaceId),
				legacyId: messageId,
				channelId: selectedChannel.isCustom ? selectedChannel.id : null,
				channelType: selectedChannel.type,
				clientId: selectedChannel.clientId ?? null,
				projectId: selectedChannel.projectId ?? null,
				senderId: String(currentUserId),
				senderName: senderDetails.senderName,
				senderRole: senderDetails.senderRole,
				content: trimmedContent,
				attachments: uploadedAttachments ?? [],
				format: "markdown",
				mentions: mentionMetadata,
				parentMessageId: options?.parentMessageId ?? null,
				threadRootId: resolvedThreadRootId,
				isThreadRoot: !options?.parentMessageId
			});
			const createdRow = await convex.query(collaborationApi.getByLegacyId, {
				workspaceId: String(workspaceId),
				legacyId: messageId
			});
			const safeCreatedMessage = (createdRow ? mapCollaborationMessageRow(createdRow, {
				fallbackChannelType: selectedChannel.type,
				fallbackClientId: selectedChannel.clientId ?? null,
				fallbackProjectId: selectedChannel.projectId ?? null,
				fallbackSenderId: String(currentUserId),
				fallbackSenderName: senderDetails.senderName,
				fallbackSenderRole: senderDetails.senderRole,
				fallbackThreadRootId: resolvedThreadRootId,
				fallbackCreatedAtIso: (/* @__PURE__ */ new Date()).toISOString()
			}) : null) ?? {
				id: messageId,
				channelType: selectedChannel.type,
				clientId: selectedChannel.clientId ?? null,
				projectId: selectedChannel.projectId ?? null,
				senderId: String(currentUserId),
				senderName: senderDetails.senderName,
				senderRole: senderDetails.senderRole,
				content: trimmedContent,
				createdAt: (/* @__PURE__ */ new Date()).toISOString(),
				updatedAt: null,
				isEdited: false,
				deletedAt: null,
				deletedBy: null,
				isDeleted: false,
				attachments: uploadedAttachments.length > 0 ? uploadedAttachments : void 0,
				format: "markdown",
				mentions: mentionMetadata.length > 0 ? mentionMetadata : void 0,
				reactions: [],
				readBy: [String(currentUserId)],
				deliveredTo: [String(currentUserId)],
				isPinned: false,
				pinnedAt: null,
				pinnedBy: null,
				sharedTo: void 0,
				parentMessageId: options?.parentMessageId ?? null,
				threadRootId: resolvedThreadRootId
			};
			mutateChannelMessages(channelId, (messages) => {
				if (messages.some((m) => m.id === safeCreatedMessage.id)) return messages;
				return [...messages, safeCreatedMessage];
			});
			if (resolvedThreadRootId) addThreadReplyToState(resolvedThreadRootId, safeCreatedMessage);
			clearAttachments();
			setMessageInput("");
			if (workspaceId) sendToExternalPlatforms(safeCreatedMessage, workspaceId);
			notifySuccess({
				title: "Message sent",
				message: "Your message is live for the team."
			});
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useChannelMessageSend:handleSendMessage",
				title: "Collaboration error",
				fallbackMessage: "Collaboration error"
			});
		} finally {
			setSending(false);
		}
	};
	return {
		handleSendMessage,
		sending,
		isSendDisabled
	};
}
/** Paginated channel message loading (older pages). */
function useChannelMessagesQuery({ convex, workspaceId, channels, isPreviewMode, nextCursorByChannel, setLoadingMoreChannelId, mutateChannelMessages, setNextCursorByChannel }) {
	const handleLoadMore = async (channelId) => {
		if (isPreviewMode) return;
		const nextCursor = nextCursorByChannel[channelId];
		if (!nextCursor) return;
		setLoadingMoreChannelId(channelId);
		try {
			const channel = channels.find((c) => c.id === channelId);
			if (!channel) throw new Error("Channel not found");
			if (!workspaceId) throw new Error("Workspace unavailable");
			const decoded = decodeTimestampIdCursor(nextCursor);
			const pageRows = (await convex.query(collaborationApi.listChannel, {
				workspaceId: String(workspaceId),
				channelId: channel.isCustom ? channel.id : null,
				channelType: channel.type,
				clientId: channel.type === "client" ? channel.clientId ?? null : null,
				projectId: channel.type === "project" ? channel.projectId ?? null : null,
				limit: 51,
				cursor: decoded ? {
					legacyId: decoded.id,
					fieldValue: decoded.time.getTime()
				} : void 0
			})).items;
			const hasMore = pageRows.length > 50;
			const trimmedRows = hasMore ? pageRows.slice(0, 50) : pageRows;
			const mapped = trimmedRows.flatMap((row) => {
				const message = mapCollaborationMessageRow(row, { fallbackChannelType: channel.type });
				return message ? [message] : [];
			}).sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());
			const oldestRow = trimmedRows.length ? trimmedRows[trimmedRows.length - 1] : null;
			const oldestCreatedAtMs = oldestRow && typeof oldestRow.createdAtMs === "number" ? oldestRow.createdAtMs : null;
			const oldestLegacyId = oldestRow && typeof oldestRow.legacyId === "string" ? oldestRow.legacyId : "";
			const newCursor = hasMore && oldestCreatedAtMs !== null ? encodeTimestampIdCursor(new Date(oldestCreatedAtMs).toISOString(), String(oldestLegacyId)) : null;
			mutateChannelMessages(channelId, (existing) => {
				const existingIds = new Set(existing.map((m) => m.id));
				return [...mapped.filter((m) => !existingIds.has(m.id)), ...existing];
			});
			setNextCursorByChannel((prev) => ({
				...prev,
				[channelId]: newCursor
			}));
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useChannelMessagesQuery:handleLoadMore",
				title: "Load error",
				fallbackMessage: "Load error"
			});
		} finally {
			setLoadingMoreChannelId(null);
		}
	};
	return { handleLoadMore };
}
function useChannelReadReceipts({ workspaceId, currentUserId, selectedChannel, channelMessages, isPreviewMode, mutateChannelMessages }) {
	const markChannelAsRead = useMutation(collaborationApi.markChannelAsRead);
	const markThreadAsReadMutation = useMutation(collaborationApi.markThreadAsRead);
	const [markChannelReadPending, setMarkChannelReadPending] = (0, import_react.useState)(false);
	const lastMarkedMessageByChannelRef = (0, import_react.useRef)({});
	const handleMarkSelectedChannelAsRead = (0, import_react.useEffectEvent)(async (options) => {
		const force = Boolean(options?.force);
		if (!currentUserId || !selectedChannel || !isPreviewMode && !workspaceId) return false;
		const markPreviewLoadedMessagesRead = () => {
			mutateChannelMessages(selectedChannel.id, (messages) => messages.map((message) => {
				if (message.isDeleted || message.senderId === currentUserId) return message;
				const readBy = Array.isArray(message.readBy) ? message.readBy : [];
				if (readBy.includes(currentUserId)) return message;
				return {
					...message,
					readBy: [...readBy, currentUserId]
				};
			}));
		};
		const latestUnread = [...channelMessages].reverse().find((message) => {
			if (message.isDeleted) return false;
			if (message.senderId === currentUserId) return false;
			return !(Array.isArray(message.readBy) ? message.readBy : []).includes(currentUserId);
		});
		if (!latestUnread) {
			if (!force) return false;
			try {
				if (isPreviewMode) {
					markPreviewLoadedMessagesRead();
					lastMarkedMessageByChannelRef.current[selectedChannel.id] = "__all__";
					return true;
				}
				await markChannelAsRead({
					workspaceId: String(workspaceId),
					channelId: selectedChannel.isCustom ? selectedChannel.id : null,
					channelType: selectedChannel.type,
					clientId: selectedChannel.type === "client" ? selectedChannel.clientId ?? null : null,
					projectId: selectedChannel.type === "project" ? selectedChannel.projectId ?? null : null,
					userId: String(currentUserId)
				});
				lastMarkedMessageByChannelRef.current[selectedChannel.id] = "__all__";
				return true;
			} catch (error) {
				logError(error, "useChannelReadReceipts:handleMarkSelectedChannelAsRead");
				if (force) throw error;
				return false;
			}
		}
		const alreadyMarked = lastMarkedMessageByChannelRef.current[selectedChannel.id];
		if (!force && alreadyMarked === latestUnread.id) return false;
		const createdAtMs = latestUnread.createdAt ? Date.parse(latestUnread.createdAt) : NaN;
		try {
			if (isPreviewMode) {
				markPreviewLoadedMessagesRead();
				lastMarkedMessageByChannelRef.current[selectedChannel.id] = latestUnread.id;
				return true;
			}
			await markChannelAsRead({
				workspaceId: String(workspaceId),
				channelId: selectedChannel.isCustom ? selectedChannel.id : null,
				channelType: selectedChannel.type,
				clientId: selectedChannel.type === "client" ? selectedChannel.clientId ?? null : null,
				projectId: selectedChannel.type === "project" ? selectedChannel.projectId ?? null : null,
				userId: String(currentUserId),
				beforeMs: Number.isFinite(createdAtMs) ? createdAtMs : void 0
			});
			lastMarkedMessageByChannelRef.current[selectedChannel.id] = latestUnread.id;
			return true;
		} catch (error) {
			logError(error, "useChannelReadReceipts:handleMarkSelectedChannelAsRead");
			if (force) throw error;
			return false;
		}
	});
	const markChannelRead = async () => {
		setMarkChannelReadPending(true);
		try {
			if (await handleMarkSelectedChannelAsRead({ force: true })) notifySuccess({
				title: "Marked as read",
				message: "Channel read state updated for you."
			});
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useChannelReadReceipts:markChannelRead",
				title: "Could not mark read",
				fallbackMessage: "Could not mark read"
			});
		} finally {
			setMarkChannelReadPending(false);
		}
	};
	const markThreadAsRead = async (threadRootId, beforeMs) => {
		if (!currentUserId || !selectedChannel || !isPreviewMode && !workspaceId) return;
		const normalizedThreadRootId = typeof threadRootId === "string" ? threadRootId.trim() : "";
		if (!normalizedThreadRootId) return;
		try {
			if (isPreviewMode) return;
			await markThreadAsReadMutation({
				workspaceId: String(workspaceId),
				channelId: selectedChannel.isCustom ? selectedChannel.id : null,
				channelType: selectedChannel.type,
				clientId: selectedChannel.type === "client" ? selectedChannel.clientId ?? null : null,
				projectId: selectedChannel.type === "project" ? selectedChannel.projectId ?? null : null,
				threadRootId: normalizedThreadRootId,
				userId: String(currentUserId),
				beforeMs
			});
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useChannelReadReceipts:markThreadAsRead",
				title: "Could not mark thread read",
				fallbackMessage: "Could not mark thread read"
			});
		}
	};
	(0, import_react.useEffect)(() => {
		if (!selectedChannel) return;
		const timer = window.setTimeout(() => {
			handleMarkSelectedChannelAsRead();
		}, 250);
		return () => {
			window.clearTimeout(timer);
		};
	}, [channelMessages, selectedChannel]);
	return {
		markChannelRead,
		markChannelReadPending,
		markThreadAsRead
	};
}
function createInitialChannelMessagesSlice() {
	return {
		messagesByChannel: {},
		nextCursorByChannel: {},
		loadingChannelId: null,
		messagesError: null
	};
}
function useMessagesData({ workspaceId, currentUserId, selectedChannel, channels, channelParticipants, fallbackDisplayName, fallbackRole, pendingAttachments, uploading, clearAttachments, uploadAttachments }) {
	const { isPreviewMode } = usePreview();
	const convex = useConvex();
	const [channelMessagesState, setChannelMessagesState] = (0, import_react.useState)(createInitialChannelMessagesSlice);
	const { messagesByChannel, nextCursorByChannel, loadingChannelId, messagesError } = channelMessagesState;
	const [loadingMoreChannelId, setLoadingMoreChannelId] = (0, import_react.useState)(null);
	const setMessagesByChannel = (action) => {
		setChannelMessagesState((prev) => ({
			...prev,
			messagesByChannel: typeof action === "function" ? action(prev.messagesByChannel) : action
		}));
	};
	const setNextCursorByChannel = (action) => {
		setChannelMessagesState((prev) => ({
			...prev,
			nextCursorByChannel: typeof action === "function" ? action(prev.nextCursorByChannel) : action
		}));
	};
	const applyRealtimeChannelLoading = (channelId) => {
		setChannelMessagesState((prev) => ({
			...prev,
			loadingChannelId: channelId,
			messagesError: null
		}));
	};
	const applyRealtimeChannelSuccess = (channelId, messages, nextCursor) => {
		setChannelMessagesState((prev) => {
			const existing = prev.messagesByChannel[channelId] ?? [];
			const serverMessageIds = new Set(messages.map((message) => message.id));
			const localOnlyMessages = existing.filter((message) => !serverMessageIds.has(message.id));
			const merged = [...messages, ...localOnlyMessages].sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());
			return {
				...prev,
				messagesByChannel: {
					...prev.messagesByChannel,
					[channelId]: merged
				},
				nextCursorByChannel: {
					...prev.nextCursorByChannel,
					[channelId]: nextCursor
				},
				loadingChannelId: prev.loadingChannelId === channelId ? null : prev.loadingChannelId,
				messagesError: null
			};
		});
	};
	const applyRealtimeChannelError = (channelId, errorMessage) => {
		setChannelMessagesState((prev) => ({
			...prev,
			loadingChannelId: prev.loadingChannelId === channelId ? null : prev.loadingChannelId,
			messagesError: errorMessage
		}));
	};
	const applyRealtimePreviewChannel = (channelId, previewMessages) => {
		setChannelMessagesState((prev) => {
			const existing = prev.messagesByChannel[channelId];
			return {
				messagesByChannel: Array.isArray(existing) ? prev.messagesByChannel : {
					...prev.messagesByChannel,
					[channelId]: previewMessages
				},
				nextCursorByChannel: prev.nextCursorByChannel[channelId] === null ? prev.nextCursorByChannel : {
					...prev.nextCursorByChannel,
					[channelId]: null
				},
				loadingChannelId: null,
				messagesError: null
			};
		});
	};
	const [channelListRetryNonce, setChannelListRetryNonce] = (0, import_react.useState)(0);
	const selectedChannelId = selectedChannel?.id ?? null;
	const [draftByChannelId, setDraftByChannelId] = (0, import_react.useState)({});
	const [messageSearchByChannelId, setMessageSearchByChannelId] = (0, import_react.useState)({});
	const messageInput = selectedChannelId ? draftByChannelId[selectedChannelId] ?? "" : "";
	const messageSearchQuery = selectedChannelId ? messageSearchByChannelId[selectedChannelId] ?? "" : "";
	(0, import_react.useEffect)(() => {
		setChannelListRetryNonce(0);
	}, [selectedChannelId]);
	const setMessageSearchQuery = (value) => {
		if (!selectedChannelId) return;
		setMessageSearchByChannelId((prev) => ({
			...prev,
			[selectedChannelId]: value
		}));
	};
	const messagesEndRef = (0, import_react.useRef)(null);
	const previewReplyTimersRef = (0, import_react.useRef)([]);
	const lastRealtimeErrorToastKeyRef = (0, import_react.useRef)(null);
	const unreadCountsResult = useQuery(collaborationApi.getUnreadCountsByChannel, !isPreviewMode && workspaceId && currentUserId ? {
		workspaceId: String(workspaceId),
		userId: String(currentUserId)
	} : "skip");
	const previewMessagesByChannel = (() => {
		if (!isPreviewMode || channels.length === 0) return {};
		const next = {};
		for (const channel of channels) next[channel.id] = getPreviewCollaborationMessages(channel.type, channel.clientId ?? null, channel.projectId ?? null, currentUserId);
		return next;
	})();
	const resolvedMessagesByChannel = (() => {
		if (!isPreviewMode) return messagesByChannel;
		return {
			...previewMessagesByChannel,
			...messagesByChannel
		};
	})();
	const resolvedNextCursorByChannel = (() => {
		if (!isPreviewMode) return nextCursorByChannel;
		const next = { ...nextCursorByChannel };
		for (const channel of channels) next[channel.id] = null;
		return next;
	})();
	const channelMessages = selectedChannel ? resolvedMessagesByChannel[selectedChannel.id] ?? [] : [];
	const threadRootIdsForUnread = (() => {
		const ids = /* @__PURE__ */ new Set();
		for (const message of channelMessages) {
			if (message.parentMessageId) continue;
			const rootId = typeof message.threadRootId === "string" && message.threadRootId.trim().length > 0 ? message.threadRootId.trim() : message.id;
			if (rootId) ids.add(rootId);
		}
		return Array.from(ids).slice(0, 200);
	})();
	const selectedChannelIdArg = selectedChannel?.isCustom ? selectedChannel.id : null;
	const threadUnreadCountsResult = useQuery(collaborationApi.getThreadUnreadCounts, !isPreviewMode && workspaceId && currentUserId && selectedChannel && threadRootIdsForUnread.length > 0 ? {
		workspaceId: String(workspaceId),
		channelId: selectedChannelIdArg,
		channelType: selectedChannel.type,
		clientId: selectedChannel.type === "client" ? selectedChannel.clientId ?? null : null,
		projectId: selectedChannel.type === "project" ? selectedChannel.projectId ?? null : null,
		threadRootIds: threadRootIdsForUnread,
		userId: String(currentUserId)
	} : "skip");
	const threadUnreadCountsQueryError = useConvexQueryError({
		data: threadUnreadCountsResult,
		skipped: isPreviewMode || !workspaceId || !currentUserId || !selectedChannel || threadRootIdsForUnread.length === 0,
		fallbackMessage: "Unable to load thread unread counts."
	});
	const collaborationQueryError = mergeQueryErrors(useConvexQueryError({
		data: unreadCountsResult,
		skipped: isPreviewMode || !workspaceId || !currentUserId,
		fallbackMessage: "Unable to load unread counts."
	}), threadUnreadCountsQueryError);
	(0, import_react.useEffect)(() => {
		const replyTimersRef = previewReplyTimersRef;
		return () => {
			replyTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
			replyTimersRef.current = [];
		};
	}, []);
	const participantNameMap = new Map(channelParticipants.map((participant) => [participant.name.toLowerCase(), participant]));
	const { normalizedMessageSearch, visibleMessages, searchingMessages, searchHighlights, searchError, retrySearch } = useChannelMessageSearch({
		convex,
		workspaceId,
		selectedChannel,
		channelMessages,
		messagesByChannel: resolvedMessagesByChannel,
		messageSearchQuery,
		isPreviewMode
	});
	const isSearchActive = Boolean(normalizedMessageSearch);
	const activeMessagesError = isSearchActive ? searchError : messagesError;
	const retryMessagesError = () => {
		if (isSearchActive) {
			retrySearch();
			return;
		}
		if (selectedChannel) applyRealtimeChannelLoading(selectedChannel.id);
		else setChannelMessagesState((prev) => ({
			...prev,
			messagesError: null
		}));
		setChannelListRetryNonce((n) => n + 1);
	};
	const channelUnreadCounts = (() => {
		if (isPreviewMode) return Object.fromEntries(channels.map((channel) => {
			const unreadCount = (resolvedMessagesByChannel[channel.id] ?? []).filter((message) => {
				if (message.isDeleted || message.parentMessageId) return false;
				if (!currentUserId) return false;
				if (message.senderId === currentUserId) return false;
				return !(Array.isArray(message.readBy) ? message.readBy : []).includes(currentUserId);
			}).length;
			return [channel.id, unreadCount];
		}));
		const source = unreadCountsResult?.countsByChannelId;
		if (!source || typeof source !== "object") return {};
		return Object.fromEntries(Object.entries(source).map(([channelId, count]) => [channelId, Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0]));
	})();
	const threadUnreadCountsByRootId = (() => {
		const source = threadUnreadCountsResult?.countsByThreadRootId;
		if (!source || typeof source !== "object") return {};
		return Object.fromEntries(Object.entries(source).map(([threadRootId, count]) => [threadRootId, Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0]));
	})();
	const channelSummaries = (() => {
		const result = /* @__PURE__ */ new Map();
		Object.entries(resolvedMessagesByChannel).forEach(([channelId, list]) => {
			if (list && list.length > 0) {
				const last = list[list.length - 1];
				if (last) result.set(channelId, {
					lastMessage: formatConversationSnippet(last.content ?? "", 160),
					lastTimestamp: last.createdAt
				});
			}
		});
		return result;
	})();
	const isCurrentChannelLoading = selectedChannel ? loadingChannelId === selectedChannel.id : false;
	const loadingMore = selectedChannel ? loadingMoreChannelId === selectedChannel.id : false;
	const canLoadMore = selectedChannel ? Boolean(resolvedNextCursorByChannel[selectedChannel.id]) : false;
	const resolveSenderDetails = () => {
		return {
			senderName: fallbackDisplayName,
			senderRole: participantNameMap.get(fallbackDisplayName.toLowerCase())?.role ?? fallbackRole
		};
	};
	const { stopTyping, notifyTyping, handleComposerFocus, handleComposerBlur } = useTyping({
		workspaceId,
		selectedChannel,
		resolveSenderDetails
	});
	const { threadMessagesByRootId, threadNextCursorByRootId, threadLoadingByRootId, threadErrorsByRootId, loadThreadReplies, loadMoreThreadReplies, clearThreadReplies, addThreadReplyToState, mutateThreadMessageById } = useThreads({
		workspaceId,
		currentUserId
	});
	const mutateChannelMessages = (channelId, updater) => {
		setMessagesByChannel((prev) => {
			const current = prev[channelId] ?? [];
			const next = updater(current);
			if (current === next) return prev;
			return {
				...prev,
				[channelId]: next
			};
		});
	};
	const { messageUpdatingId, messageDeletingId, reactionUpdatingByMessage, handleEditMessage: handleEditMessageBase, handleDeleteMessage: handleDeleteMessageBase, handleToggleReaction: handleToggleReactionBase } = useMessageActions({
		workspaceId,
		userId: currentUserId,
		isPreviewMode,
		channels,
		channelParticipants,
		mutateChannelMessages,
		mutateThreadMessageById
	});
	const handleRealtimeMessagesError = (channel, errorMessage) => {
		const toastKey = `${channel.id}:${channelListRetryNonce}:${errorMessage}`;
		if (lastRealtimeErrorToastKeyRef.current === toastKey) return;
		lastRealtimeErrorToastKeyRef.current = toastKey;
		notifyFailure({
			title: "Unable to load messages",
			message: `${channel.name}: ${errorMessage}`
		});
	};
	const realtimeChannelSnapshot = useRealtimeChannelSnapshot({
		workspaceId,
		selectedChannel,
		currentUserId,
		channelListRetryNonce
	});
	const realtimeSnapshotApplyKey = (() => {
		switch (realtimeChannelSnapshot.kind) {
			case "idle": return "idle";
			case "loading": return `loading:${realtimeChannelSnapshot.channelId}`;
			case "success": return `success:${realtimeChannelSnapshot.channelId}:${realtimeChannelSnapshot.messages.length}:${realtimeChannelSnapshot.nextCursor ?? ""}`;
			case "error": return `error:${realtimeChannelSnapshot.channelId}:${realtimeChannelSnapshot.errorMessage}`;
			case "preview": return `preview:${realtimeChannelSnapshot.channelId}:${realtimeChannelSnapshot.messages.length}`;
			default: return realtimeChannelSnapshot;
		}
	})();
	const applyRealtimeSnapshot = (0, import_react.useEffectEvent)(() => {
		switch (realtimeChannelSnapshot.kind) {
			case "idle": break;
			case "loading":
				applyRealtimeChannelLoading(realtimeChannelSnapshot.channelId);
				break;
			case "success":
				applyRealtimeChannelSuccess(realtimeChannelSnapshot.channelId, realtimeChannelSnapshot.messages, realtimeChannelSnapshot.nextCursor);
				break;
			case "error":
				applyRealtimeChannelError(realtimeChannelSnapshot.channelId, realtimeChannelSnapshot.errorMessage);
				if (selectedChannel) handleRealtimeMessagesError(selectedChannel, realtimeChannelSnapshot.errorMessage);
				break;
			case "preview":
				applyRealtimePreviewChannel(realtimeChannelSnapshot.channelId, realtimeChannelSnapshot.messages);
				break;
			default: break;
		}
	});
	(0, import_react.useEffect)(() => {
		applyRealtimeSnapshot();
	}, [
		realtimeSnapshotApplyKey,
		realtimeChannelSnapshot,
		selectedChannel
	]);
	const { typingParticipants } = useRealtimeTyping({
		userId: currentUserId,
		workspaceId,
		selectedChannel
	});
	const handleEditMessage = async (channelId, messageId, nextContent) => {
		await handleEditMessageBase(channelId, messageId, nextContent);
	};
	const handleDeleteMessage = async (channelId, messageId) => {
		await handleDeleteMessageBase(channelId, messageId);
	};
	const handleToggleReaction = async (channelId, messageId, emoji) => {
		await handleToggleReactionBase(channelId, messageId, emoji);
	};
	const { markChannelRead, markChannelReadPending, markThreadAsRead } = useChannelReadReceipts({
		workspaceId,
		currentUserId,
		selectedChannel,
		channelMessages,
		isPreviewMode,
		mutateChannelMessages
	});
	const { sendCollaborationEmailCopy } = useCollaborationExternalNotify();
	const { handleSendMessage, sending, isSendDisabled } = useChannelMessageSend({
		workspaceId,
		currentUserId,
		selectedChannel,
		channels,
		channelMessages,
		channelParticipants,
		fallbackDisplayName,
		fallbackRole,
		messageInput,
		setMessageInput: (value) => {
			if (!selectedChannelId) return;
			setDraftByChannelId((prev) => ({
				...prev,
				[selectedChannelId]: value
			}));
		},
		pendingAttachments,
		uploading,
		clearAttachments,
		uploadAttachments,
		isPreviewMode,
		stopTyping,
		mutateChannelMessages,
		addThreadReplyToState,
		sendToExternalPlatforms: sendCollaborationEmailCopy
	});
	const { handleLoadMore } = useChannelMessagesQuery({
		convex,
		workspaceId,
		channels,
		isPreviewMode,
		nextCursorByChannel: resolvedNextCursorByChannel,
		setLoadingMoreChannelId,
		mutateChannelMessages,
		setNextCursorByChannel
	});
	const setMessageInput = (value) => {
		if (!selectedChannelId) return;
		setDraftByChannelId((prev) => ({
			...prev,
			[selectedChannelId]: value
		}));
		if (value.trim().length > 0) notifyTyping();
	};
	return {
		channelMessages,
		visibleMessages,
		searchingMessages,
		searchHighlights,
		messageSearchQuery,
		setMessageSearchQuery,
		isCurrentChannelLoading,
		messagesError: activeMessagesError,
		retryMessagesError,
		channelSummaries,
		messageInput,
		setMessageInput,
		typingParticipants,
		handleComposerFocus,
		handleComposerBlur,
		handleSendMessage,
		sending,
		isSendDisabled,
		messagesEndRef,
		handleEditMessage,
		handleDeleteMessage,
		handleToggleReaction,
		messageUpdatingId,
		messageDeletingId,
		handleLoadMore,
		canLoadMore,
		loadingMore,
		threadMessagesByRootId,
		threadNextCursorByRootId,
		threadLoadingByRootId,
		threadErrorsByRootId,
		threadUnreadCountsByRootId,
		loadThreadReplies,
		loadMoreThreadReplies,
		markThreadAsRead,
		clearThreadReplies,
		reactionPendingByMessage: reactionUpdatingByMessage,
		channelUnreadCounts,
		markChannelRead,
		markChannelReadPending,
		collaborationQueryError
	};
}
function isProjectStatus(value) {
	return typeof value === "string" && PROJECT_STATUSES.includes(value);
}
function useProjectsData({ workspaceId, userId, selectedClientId, isPreviewMode }) {
	const projectsRealtime = useQuery(projectsApi.list, isPreviewMode || !workspaceId || !userId ? "skip" : {
		workspaceId,
		clientId: selectedClientId ?? void 0,
		limit: 100
	});
	const projectsQueryError = useConvexQueryError({
		data: projectsRealtime,
		skipped: isPreviewMode || !workspaceId || !userId,
		fallbackMessage: "Unable to load projects."
	});
	const { projects, projectsLoading } = (() => {
		if (isPreviewMode) return {
			projects: getPreviewProjects(selectedClientId ?? null),
			projectsLoading: false
		};
		if (!workspaceId || !userId) return {
			projects: [],
			projectsLoading: false
		};
		if (!projectsRealtime) return {
			projects: [],
			projectsLoading: true
		};
		return {
			projects: (Array.isArray(projectsRealtime) ? projectsRealtime : []).map((row) => ({
				id: String(row.legacyId),
				name: String(row.name ?? ""),
				description: typeof row.description === "string" ? row.description : null,
				status: isProjectStatus(row.status) ? row.status : "planning",
				clientId: typeof row.clientId === "string" ? row.clientId : null,
				clientName: typeof row.clientName === "string" ? row.clientName : null,
				startDate: typeof row.startDateMs === "number" ? new Date(row.startDateMs).toISOString() : null,
				endDate: typeof row.endDateMs === "number" ? new Date(row.endDateMs).toISOString() : null,
				tags: Array.isArray(row.tags) ? row.tags : [],
				ownerId: typeof row.ownerId === "string" ? row.ownerId : null,
				createdAt: typeof row.createdAtMs === "number" ? new Date(row.createdAtMs).toISOString() : null,
				updatedAt: typeof row.updatedAtMs === "number" ? new Date(row.updatedAtMs).toISOString() : null,
				taskCount: 0,
				openTaskCount: 0,
				recentActivityAt: null,
				deletedAt: typeof row.deletedAtMs === "number" ? new Date(row.deletedAtMs).toISOString() : null
			})),
			projectsLoading: false
		};
	})();
	return {
		projects,
		projectsLoading,
		projectsQueryError
	};
}
function useCollaborationData() {
	const { user } = useAuth();
	const { clients, selectedClient, loading: clientsLoading } = useClientContext();
	const { isPreviewMode } = usePreview();
	const workspaceId = user?.agencyId ? String(user.agencyId) : null;
	const userId = user?.id ?? null;
	const fallbackRole = "Account Owner";
	const fallbackDisplayName = user?.name && user.name.trim().length > 0 ? user.name.trim() : user?.email && user.email.trim().length > 0 ? user.email.trim() : "You";
	const currentUserId = user?.id ?? null;
	const currentUserRole = user?.role ?? null;
	const selectedClientId = selectedClient?.id ?? null;
	const { projects, projectsLoading } = useProjectsData({
		workspaceId,
		userId,
		selectedClientId,
		isPreviewMode
	});
	const customChannelsResult = useQuery(collaborationChannelsApi.listAccessible, !isPreviewMode && workspaceId ? {
		workspaceId: String(workspaceId),
		channelType: "team"
	} : "skip");
	const channelAvatarsResult = useQuery(collaborationChannelAvatarsApi.listForWorkspace, !isPreviewMode && workspaceId ? { workspaceId: String(workspaceId) } : "skip");
	const channelsQueryError = mergeQueryErrors(useConvexQueryError({
		data: customChannelsResult,
		skipped: isPreviewMode || !workspaceId,
		fallbackMessage: "Unable to load collaboration channels."
	}), useConvexQueryError({
		data: channelAvatarsResult,
		skipped: isPreviewMode || !workspaceId,
		fallbackMessage: "Unable to load channel avatars."
	}));
	const channelAvatars = (() => {
		const map = /* @__PURE__ */ new Map();
		for (const row of channelAvatarsResult ?? []) if (typeof row?.channelKey === "string" && typeof row?.avatarUrl === "string" && row.avatarUrl.length > 0) map.set(row.channelKey, row.avatarUrl);
		return map;
	})();
	const { channels, selectedChannel, searchQuery, setSearchQuery, filteredChannels, selectChannel, channelParticipants, totalChannels, totalParticipants } = useChannelsData({
		clients,
		projects,
		customChannels: (customChannelsResult ?? []).flatMap((channel) => typeof channel?.legacyId === "string" && typeof channel?.name === "string" ? [{
			legacyId: String(channel.legacyId),
			name: String(channel.name),
			description: typeof channel.description === "string" ? channel.description : null,
			visibility: channel.visibility === "public" ? "public" : "private",
			memberIds: Array.isArray(channel.memberIds) ? channel.memberIds.filter((memberId) => typeof memberId === "string") : [],
			memberSummaries: Array.isArray(channel.memberSummaries) ? channel.memberSummaries.flatMap((member) => typeof member?.id === "string" && typeof member?.name === "string" ? [{
				id: member.id,
				name: member.name,
				role: typeof member.role === "string" ? member.role : null
			}] : []) : []
		}] : []),
		fallbackDisplayName,
		fallbackRole,
		visibleClientId: selectedClientId,
		channelAvatars
	});
	const { pendingAttachments, uploading, handleAddAttachments, handleRemoveAttachment, clearAttachments, uploadAttachments } = useAttachmentsData({
		userId: currentUserId,
		workspaceId
	});
	const messages = useMessagesData({
		workspaceId,
		currentUserId,
		selectedChannel,
		channels,
		channelParticipants,
		fallbackDisplayName,
		fallbackRole,
		pendingAttachments,
		uploading,
		clearAttachments,
		uploadAttachments
	});
	const isBootstrapping = (clientsLoading || projectsLoading) && channels.length === 0;
	const sharedFiles = (() => {
		return collectSharedFiles(messages.channelMessages.flatMap((message) => !message.isDeleted && Array.isArray(message.attachments) && message.attachments.length > 0 ? [message.attachments ?? []] : []));
	})();
	return {
		channels,
		filteredChannels,
		searchQuery,
		setSearchQuery,
		selectedChannel,
		selectChannel,
		channelSummaries: messages.channelSummaries,
		channelUnreadCounts: messages.channelUnreadCounts,
		channelMessages: messages.channelMessages,
		visibleMessages: messages.visibleMessages,
		searchingMessages: messages.searchingMessages,
		searchHighlights: messages.searchHighlights,
		isCurrentChannelLoading: messages.isCurrentChannelLoading,
		isBootstrapping,
		messagesError: mergeQueryErrors(messages.messagesError, channelsQueryError),
		retryMessagesError: messages.retryMessagesError,
		messageSearchQuery: messages.messageSearchQuery,
		setMessageSearchQuery: messages.setMessageSearchQuery,
		totalChannels,
		totalParticipants,
		channelParticipants,
		sharedFiles,
		messageInput: messages.messageInput,
		setMessageInput: messages.setMessageInput,
		pendingAttachments,
		handleAddAttachments,
		handleRemoveAttachment,
		clearPendingAttachments: clearAttachments,
		uploadPendingAttachments: uploadAttachments,
		uploading,
		typingParticipants: messages.typingParticipants,
		handleComposerFocus: messages.handleComposerFocus,
		handleComposerBlur: messages.handleComposerBlur,
		handleSendMessage: messages.handleSendMessage,
		sending: messages.sending,
		isSendDisabled: messages.isSendDisabled,
		messagesEndRef: messages.messagesEndRef,
		handleEditMessage: messages.handleEditMessage,
		handleDeleteMessage: messages.handleDeleteMessage,
		handleToggleReaction: messages.handleToggleReaction,
		messageUpdatingId: messages.messageUpdatingId,
		messageDeletingId: messages.messageDeletingId,
		handleLoadMore: messages.handleLoadMore,
		canLoadMore: messages.canLoadMore,
		loadingMore: messages.loadingMore,
		currentUserId,
		currentUserRole,
		threadMessagesByRootId: messages.threadMessagesByRootId,
		threadNextCursorByRootId: messages.threadNextCursorByRootId,
		threadLoadingByRootId: messages.threadLoadingByRootId,
		threadErrorsByRootId: messages.threadErrorsByRootId,
		threadUnreadCountsByRootId: messages.threadUnreadCountsByRootId,
		loadThreadReplies: messages.loadThreadReplies,
		loadMoreThreadReplies: messages.loadMoreThreadReplies,
		markThreadAsRead: messages.markThreadAsRead,
		clearThreadReplies: messages.clearThreadReplies,
		markChannelRead: messages.markChannelRead,
		markChannelReadPending: messages.markChannelReadPending,
		reactionPendingByMessage: messages.reactionPendingByMessage
	};
}
function normalizeField(value) {
	if (!value) return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}
function parseDirectMessageSearchQuery(input) {
	const tokens = input.split(/\s+/).filter(Boolean);
	const terms = [];
	let sender = null;
	let attachment = null;
	let start = null;
	let end = null;
	tokens.forEach((token) => {
		const lower = token.toLowerCase();
		if (lower.startsWith("from:")) sender = token.slice(5);
		else if (lower.startsWith("attachment:")) attachment = token.slice(11);
		else if (lower.startsWith("before:")) end = token.slice(7);
		else if (lower.startsWith("after:")) start = token.slice(6);
		else terms.push(token);
	});
	const highlights = [...terms];
	if (sender) highlights.push(sender);
	if (attachment) highlights.push(attachment);
	return {
		q: terms.join(" ").trim(),
		sender: normalizeField(sender),
		attachment: normalizeField(attachment),
		start: normalizeField(start),
		end: normalizeField(end),
		highlights: highlights.filter(Boolean)
	};
}
function filterDirectMessagesForSearch(messages, search) {
	const queryTerms = search.q.toLowerCase().split(/\s+/).filter(Boolean);
	const senderSearch = search.sender?.toLowerCase() ?? null;
	const attachmentSearch = search.attachment?.toLowerCase() ?? null;
	const startMs = search.start ? Date.parse(search.start) : NaN;
	const endMs = search.end ? Date.parse(search.end) : NaN;
	return messages.filter((message) => {
		if (message.deleted) return false;
		const attachmentNames = (message.attachments ?? []).map((attachment) => attachment.name.toLowerCase());
		const haystack = [
			message.content,
			message.senderName,
			...attachmentNames
		].join(" ").toLowerCase();
		const matchesQuery = queryTerms.every((term) => haystack.includes(term));
		const matchesSender = !senderSearch || message.senderName.toLowerCase().includes(senderSearch);
		const matchesAttachment = !attachmentSearch || attachmentNames.some((name) => name.includes(attachmentSearch));
		const matchesStart = !Number.isFinite(startMs) || message.createdAtMs >= startMs;
		const matchesEnd = !Number.isFinite(endMs) || message.createdAtMs <= endMs;
		return matchesQuery && matchesSender && matchesAttachment && matchesStart && matchesEnd;
	}).sort((a, b) => b.createdAtMs - a.createdAtMs);
}
function parsePaginatedDirectMessagesQuery(queryData, expectedConversationLegacyId) {
	if (!queryData || typeof queryData !== "object" || !("items" in queryData)) return null;
	const record = queryData;
	const items = Array.isArray(record.items) ? record.items.map((item) => {
		const row = item;
		return {
			id: row.legacyId,
			legacyId: row.legacyId,
			senderId: row.senderId,
			senderName: row.senderName,
			senderRole: row.senderRole,
			content: row.content,
			edited: row.edited,
			editedAtMs: row.editedAtMs,
			deleted: row.deleted,
			deletedAtMs: row.deletedAtMs,
			deletedBy: row.deletedBy,
			attachments: row.attachments,
			reactions: row.reactions,
			readBy: row.readBy,
			deliveredTo: row.deliveredTo,
			readAtMs: row.readAtMs,
			sharedTo: row.sharedTo,
			createdAtMs: row.createdAtMs,
			updatedAtMs: row.updatedAtMs
		};
	}) : [];
	if (expectedConversationLegacyId && items.length > 0) {
		if (items.some((item) => typeof item.conversationLegacyId === "string" && item.conversationLegacyId !== expectedConversationLegacyId)) return null;
	}
	return {
		items,
		nextCursor: record.nextCursor ?? null
	};
}
function useDirectConversationsQuery({ workspaceId, currentUserId, currentUserName, currentUserRole }) {
	const { isPreviewMode } = usePreview();
	const convex = useConvex();
	const [selectedConversation, setSelectedConversation] = (0, import_react.useState)(null);
	const [isSending, setIsSending] = (0, import_react.useState)(false);
	const [feed, setFeed] = (0, import_react.useState)({
		pagination: {
			messageCursor: null,
			allMessages: [],
			hasMore: true,
			isLoadingMore: false
		},
		previewData: {
			conversations: [],
			messagesByConversation: {}
		},
		search: {
			results: [],
			highlights: [],
			searching: false,
			error: null
		}
	});
	const { pagination, previewData, search } = feed;
	const { messageCursor, allMessages, hasMore, isLoadingMore } = pagination;
	const { conversations: previewConversations, messagesByConversation: previewMessagesByConversation } = previewData;
	const { results: searchResults, highlights: searchHighlights, searching: searchingMessages, error: searchError } = search;
	const [messageSearchByConversationId, setMessageSearchByConversationId] = (0, import_react.useState)({});
	const [searchRetryNonce, setSearchRetryNonce] = (0, import_react.useState)(0);
	const previewReplyTimersRef = (0, import_react.useRef)([]);
	const conversationsQuery = useQuery(api$1.directMessages.listConversations, !isPreviewMode && workspaceId ? {
		workspaceId,
		includeArchived: false
	} : "skip");
	const unreadCountQuery = useQuery(api$1.directMessages.getUnreadCount, !isPreviewMode && workspaceId ? { workspaceId } : "skip");
	const conversationsQueryError = useConvexQueryError({
		data: conversationsQuery,
		skipped: isPreviewMode || !workspaceId,
		fallbackMessage: "Unable to load conversations."
	});
	const unreadCountQueryError = useConvexQueryError({
		data: unreadCountQuery,
		skipped: isPreviewMode || !workspaceId,
		fallbackMessage: "Unable to load unread counts."
	});
	const messagesQueryArgs = !isPreviewMode && selectedConversation && workspaceId ? {
		workspaceId,
		conversationLegacyId: selectedConversation.legacyId,
		cursor: messageCursor,
		limit: 100
	} : null;
	const messagesQueryArgsRef = (0, import_react.useRef)(messagesQueryArgs);
	const messagesQueryArgsKey = (() => {
		if (!messagesQueryArgs) return null;
		const cursorKey = messagesQueryArgs.cursor ? `${messagesQueryArgs.cursor.fieldValue}|${messagesQueryArgs.cursor.legacyId}` : "start";
		return `${messagesQueryArgs.workspaceId}|${messagesQueryArgs.conversationLegacyId}|${cursorKey}`;
	})();
	const messagesQueryArgsChanged = messagesQueryArgsKey !== null && messagesQueryArgsRef.current !== null && messagesQueryArgsKey !== (messagesQueryArgsRef.current ? `${messagesQueryArgsRef.current.workspaceId}|${messagesQueryArgsRef.current.conversationLegacyId}|${messagesQueryArgsRef.current.cursor ? `${messagesQueryArgsRef.current.cursor.fieldValue}|${messagesQueryArgsRef.current.cursor.legacyId}` : "start"}` : null);
	if (messagesQueryArgsChanged) messagesQueryArgsRef.current = messagesQueryArgs;
	const messagesQuery = useQuery(api$1.directMessages.listMessages, messagesQueryArgs ?? "skip");
	const dmQueryError = mergeQueryErrors(conversationsQueryError, unreadCountQueryError, useConvexQueryError({
		data: messagesQuery,
		skipped: isPreviewMode || !messagesQueryArgs,
		fallbackMessage: "Unable to load messages."
	}));
	const typedMessagesQuery = messagesQueryArgsChanged ? void 0 : messagesQuery;
	const conversationRows = conversationsQuery ?? [];
	const selectedConversationLegacyId = selectedConversation?.legacyId ?? null;
	const messageSearchQuery = selectedConversationLegacyId ? messageSearchByConversationId[selectedConversationLegacyId] ?? "" : "";
	const normalizedMessageSearch = messageSearchQuery.trim();
	const setMessageSearchQuery = (value) => {
		if (!selectedConversationLegacyId) return;
		setMessageSearchByConversationId((prev) => ({
			...prev,
			[selectedConversationLegacyId]: value
		}));
	};
	(0, import_react.useEffect)(() => {
		const replyTimersRef = previewReplyTimersRef;
		return () => {
			replyTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
			replyTimersRef.current = [];
		};
	}, []);
	const previewFeedSnapshot = (() => {
		if (!isPreviewMode) return null;
		const previewSelf = {
			id: currentUserId,
			name: currentUserName,
			role: currentUserRole
		};
		const previewUserId = currentUserId ?? "preview-current-user";
		const messagesByConversation = Object.fromEntries(getPreviewDirectConversations(previewSelf).map((conversation) => [conversation.legacyId, getPreviewDirectMessages(conversation.legacyId, previewSelf)]));
		const conversations = getPreviewDirectConversations(previewSelf).map((conversation) => {
			const messages = messagesByConversation[conversation.legacyId] ?? [];
			const lastMessage = messages.reduce((latest, message) => {
				if (latest === null || message.createdAtMs > latest.createdAtMs) return message;
				return latest;
			}, null);
			const isRead = !messages.some((message) => message.senderId !== previewUserId && !message.readBy.includes(previewUserId));
			return {
				...conversation,
				lastMessageSnippet: lastMessage?.deleted ? "Message deleted" : lastMessage?.content ? formatConversationSnippet(lastMessage.content, 160) : null,
				lastMessageAtMs: lastMessage?.createdAtMs ?? conversation.lastMessageAtMs ?? null,
				lastMessageSenderId: lastMessage?.senderId ?? conversation.lastMessageSenderId ?? null,
				isRead,
				unreadCount: isRead ? 0 : 1,
				updatedAtMs: lastMessage?.updatedAtMs ?? conversation.updatedAtMs
			};
		}).sort((a, b) => (b.lastMessageAtMs ?? 0) - (a.lastMessageAtMs ?? 0));
		return {
			key: `${currentUserId ?? ""}|${currentUserName ?? ""}|${currentUserRole ?? ""}|${conversations.length}|${conversations[0]?.updatedAtMs ?? 0}`,
			conversations,
			messagesByConversation
		};
	})();
	const previewFeedSnapshotRef = (0, import_react.useRef)(null);
	if (previewFeedSnapshot && previewFeedSnapshotRef.current !== previewFeedSnapshot.key) {
		previewFeedSnapshotRef.current = previewFeedSnapshot.key;
		setFeed((prev) => ({
			...prev,
			previewData: {
				conversations: previewFeedSnapshot.conversations,
				messagesByConversation: previewFeedSnapshot.messagesByConversation
			},
			pagination: {
				messageCursor: null,
				allMessages: [],
				hasMore: false,
				isLoadingMore: false
			}
		}));
	}
	const liveMessagesFromQuery = (() => {
		if (isPreviewMode || !typedMessagesQuery) return null;
		const parsed = parsePaginatedDirectMessagesQuery(typedMessagesQuery, selectedConversationLegacyId);
		if (!parsed) return null;
		return {
			key: `${selectedConversationLegacyId ?? ""}|${messageCursor ? "cursor" : "root"}|${isLoadingMore ? "more" : "fresh"}|${parsed.items.length}|${parsed.nextCursor ? "has-more" : "end"}`,
			newMessages: parsed.items,
			hasMore: Boolean(parsed.nextCursor),
			loadingMore: isLoadingMore && Boolean(messageCursor)
		};
	})();
	const conversationPaginationKey = `${isPreviewMode}|${selectedConversationLegacyId ?? ""}`;
	const conversationPaginationKeyRef = (0, import_react.useRef)(null);
	const liveMessagesSnapshotRef = (0, import_react.useRef)(null);
	const conversationChanged = conversationPaginationKeyRef.current !== conversationPaginationKey;
	const liveMessagesChanged = Boolean(liveMessagesFromQuery) && liveMessagesSnapshotRef.current !== liveMessagesFromQuery?.key;
	if (conversationChanged || liveMessagesChanged) {
		if (conversationChanged) conversationPaginationKeyRef.current = conversationPaginationKey;
		if (liveMessagesFromQuery && liveMessagesChanged) liveMessagesSnapshotRef.current = liveMessagesFromQuery?.key ?? null;
		setFeed((prev) => {
			const basePagination = conversationChanged ? {
				messageCursor: null,
				allMessages: [],
				hasMore: !isPreviewMode,
				isLoadingMore: false
			} : prev.pagination;
			if (!liveMessagesFromQuery) return conversationChanged ? {
				...prev,
				pagination: basePagination
			} : prev;
			const byLegacyId = new Map(basePagination.allMessages.map((message) => [message.legacyId, message]));
			if (liveMessagesFromQuery.loadingMore) {
				for (const message of liveMessagesFromQuery.newMessages) if (!byLegacyId.has(message.legacyId)) byLegacyId.set(message.legacyId, message);
			} else {
				byLegacyId.clear();
				for (const message of liveMessagesFromQuery.newMessages) byLegacyId.set(message.legacyId, message);
			}
			return {
				...prev,
				pagination: {
					...basePagination,
					allMessages: Array.from(byLegacyId.values()).sort((a, b) => b.createdAtMs - a.createdAtMs),
					hasMore: liveMessagesFromQuery.hasMore,
					isLoadingMore: liveMessagesFromQuery.loadingMore ? false : basePagination.isLoadingMore
				}
			};
		});
	}
	const resolvedSelectedConversation = (() => {
		if (!selectedConversation) return null;
		return (isPreviewMode ? previewConversations : conversationRows.map((c) => ({
			id: c._id,
			legacyId: c.legacyId,
			otherParticipantId: c.otherParticipantId,
			otherParticipantName: c.otherParticipantName,
			otherParticipantRole: c.otherParticipantRole,
			lastMessageSnippet: c.lastMessageSnippet,
			lastMessageAtMs: c.lastMessageAtMs,
			lastMessageSenderId: c.lastMessageSenderId,
			isRead: c.isRead,
			unreadCount: c.unreadCount,
			isArchived: c.isArchived,
			isMuted: c.isMuted,
			createdAtMs: c.createdAtMs,
			updatedAtMs: c.updatedAtMs
		}))).find((conversation) => conversation.legacyId === selectedConversation.legacyId) ?? null;
	})();
	if (selectedConversation && resolvedSelectedConversation && resolvedSelectedConversation.updatedAtMs !== selectedConversation.updatedAtMs) setSelectedConversation(resolvedSelectedConversation);
	else if (selectedConversation && !resolvedSelectedConversation && !isPreviewMode && conversationsQuery !== void 0) setSelectedConversation(null);
	const liveConversations = conversationRows.map((c) => ({
		id: c._id,
		legacyId: c.legacyId,
		otherParticipantId: c.otherParticipantId,
		otherParticipantName: c.otherParticipantName,
		otherParticipantRole: c.otherParticipantRole,
		lastMessageSnippet: c.lastMessageSnippet,
		lastMessageAtMs: c.lastMessageAtMs,
		lastMessageSenderId: c.lastMessageSenderId,
		isRead: c.isRead,
		unreadCount: c.unreadCount,
		isArchived: c.isArchived,
		isMuted: c.isMuted,
		createdAtMs: c.createdAtMs,
		updatedAtMs: c.updatedAtMs
	})).sort((a, b) => (b.lastMessageAtMs ?? 0) - (a.lastMessageAtMs ?? 0));
	const conversations = isPreviewMode ? previewConversations : liveConversations;
	const currentMessages = isPreviewMode ? selectedConversation ? previewMessagesByConversation[selectedConversation.legacyId] ?? [] : [] : allMessages;
	const visibleMessages = normalizedMessageSearch ? searchResults : currentMessages;
	const retryDirectMessageSearch = () => {
		setSearchRetryNonce((n) => n + 1);
	};
	const resolvedSyncSearch = (() => {
		if (!selectedConversation || !normalizedMessageSearch) return {
			results: [],
			highlights: [],
			searching: false,
			error: null
		};
		const parsed = parseDirectMessageSearchQuery(normalizedMessageSearch);
		if (isPreviewMode) return {
			results: filterDirectMessagesForSearch(previewMessagesByConversation[selectedConversation.legacyId] ?? [], parsed),
			highlights: parsed.highlights,
			searching: false,
			error: null
		};
		if (!workspaceId) return {
			results: [],
			highlights: parsed.highlights,
			searching: false,
			error: null
		};
		return null;
	})();
	const syncSearchSnapshotRef = (0, import_react.useRef)(null);
	if (resolvedSyncSearch !== null) {
		const syncSearchKey = `${selectedConversation?.legacyId ?? ""}|${normalizedMessageSearch}|${resolvedSyncSearch.results.length}|${resolvedSyncSearch.searching ? "loading" : "ready"}`;
		if (syncSearchSnapshotRef.current !== syncSearchKey) {
			syncSearchSnapshotRef.current = syncSearchKey;
			setFeed((prev) => ({
				...prev,
				search: resolvedSyncSearch
			}));
		}
	}
	const fetchDirectMessageSearch = (0, import_react.useEffectEvent)(async (isCancelled) => {
		if (!selectedConversation || !normalizedMessageSearch || !workspaceId) return;
		const parsed = parseDirectMessageSearchQuery(normalizedMessageSearch);
		const startMs = parsed.start ? Date.parse(parsed.start) : NaN;
		const endMs = parsed.end ? Date.parse(parsed.end) : NaN;
		setFeed((prev) => ({
			...prev,
			search: {
				...prev.search,
				searching: true,
				error: null
			}
		}));
		if (isCancelled()) return;
		try {
			const payload = await convex.query(directMessagesApi.searchMessages, {
				workspaceId: String(workspaceId),
				conversationLegacyId: selectedConversation.legacyId,
				q: parsed.q || null,
				sender: parsed.sender ?? null,
				attachment: parsed.attachment ?? null,
				startMs: Number.isFinite(startMs) ? startMs : null,
				endMs: Number.isFinite(endMs) ? endMs : null,
				limit: 200
			});
			if (isCancelled()) return;
			const rows = Array.isArray(payload?.rows) ? payload.rows : [];
			const highlights = Array.isArray(payload?.highlights) ? payload.highlights.filter((entry) => typeof entry === "string") : parsed.highlights;
			const mapped = rows.flatMap((row) => {
				const item = row ?? {};
				const legacyId = String(item.legacyId ?? "");
				if (!legacyId) return [];
				return [{
					id: String(item._id ?? ""),
					legacyId,
					senderId: String(item.senderId ?? ""),
					senderName: typeof item.senderName === "string" ? item.senderName : "Unknown teammate",
					senderRole: typeof item.senderRole === "string" ? item.senderRole : null,
					content: typeof item.content === "string" ? item.content : "",
					edited: Boolean(item.edited),
					editedAtMs: typeof item.editedAtMs === "number" ? item.editedAtMs : null,
					deleted: Boolean(item.deleted),
					deletedAtMs: typeof item.deletedAtMs === "number" ? item.deletedAtMs : null,
					deletedBy: typeof item.deletedBy === "string" ? item.deletedBy : null,
					attachments: Array.isArray(item.attachments) ? item.attachments : null,
					reactions: Array.isArray(item.reactions) ? item.reactions : null,
					readBy: Array.isArray(item.readBy) ? item.readBy.filter((value) => typeof value === "string") : [],
					deliveredTo: Array.isArray(item.deliveredTo) ? item.deliveredTo.filter((value) => typeof value === "string") : [],
					readAtMs: typeof item.readAtMs === "number" ? item.readAtMs : null,
					sharedTo: Array.isArray(item.sharedTo) ? item.sharedTo.filter((value) => value === "email") : null,
					createdAtMs: typeof item.createdAtMs === "number" ? item.createdAtMs : 0,
					updatedAtMs: typeof item.updatedAtMs === "number" ? item.updatedAtMs : 0
				}];
			}).sort((a, b) => b.createdAtMs - a.createdAtMs);
			setFeed((prev) => ({
				...prev,
				search: {
					results: mapped,
					highlights,
					searching: false,
					error: null
				}
			}));
		} catch (error) {
			if (isCancelled()) return;
			logError(error, "useDirectMessages:searchMessages");
			setFeed((prev) => ({
				...prev,
				search: {
					results: [],
					highlights: parsed.highlights,
					searching: false,
					error: asErrorMessage(error)
				}
			}));
		}
	});
	(0, import_react.useEffect)(() => {
		if (resolvedSyncSearch !== null) return;
		let cancelled = false;
		fetchDirectMessageSearch(() => cancelled);
		return () => {
			cancelled = true;
		};
	}, [
		normalizedMessageSearch,
		resolvedSyncSearch,
		searchRetryNonce,
		selectedConversation?.legacyId,
		workspaceId
	]);
	const selectConversation = (conversation) => {
		liveMessagesSnapshotRef.current = null;
		setSelectedConversation(conversation);
		setFeed((prev) => ({
			...prev,
			pagination: {
				...prev.pagination,
				messageCursor: null,
				allMessages: [],
				hasMore: !isPreviewMode,
				isLoadingMore: false
			}
		}));
	};
	const loadMoreMessages = () => {
		if (isPreviewMode) return;
		if (typedMessagesQuery?.nextCursor && hasMore && !isLoadingMore) setFeed((prev) => ({
			...prev,
			pagination: {
				...prev.pagination,
				isLoadingMore: true,
				messageCursor: typedMessagesQuery.nextCursor
			}
		}));
	};
	return {
		convex,
		isPreviewMode,
		workspaceId,
		currentUserId,
		currentUserName,
		currentUserRole,
		selectedConversation,
		setSelectedConversation,
		isSending,
		setIsSending,
		messageCursor,
		setMessageCursor: (cursor) => setFeed((prev) => ({
			...prev,
			pagination: {
				...prev.pagination,
				messageCursor: cursor
			}
		})),
		allMessages,
		setAllMessages: (messages) => setFeed((prev) => ({
			...prev,
			pagination: {
				...prev.pagination,
				allMessages: typeof messages === "function" ? messages(prev.pagination.allMessages) : messages
			}
		})),
		hasMore,
		setHasMore: (value) => setFeed((prev) => ({
			...prev,
			pagination: {
				...prev.pagination,
				hasMore: value
			}
		})),
		isLoadingMore,
		setIsLoadingMore: (value) => setFeed((prev) => ({
			...prev,
			pagination: {
				...prev.pagination,
				isLoadingMore: value
			}
		})),
		messageSearchQuery,
		setMessageSearchQuery,
		searchResults,
		setSearchResults: (results) => setFeed((prev) => ({
			...prev,
			search: {
				...prev.search,
				results
			}
		})),
		searchHighlights,
		setSearchHighlights: (highlights) => setFeed((prev) => ({
			...prev,
			search: {
				...prev.search,
				highlights
			}
		})),
		searchingMessages,
		setSearchingMessages: (searching) => setFeed((prev) => ({
			...prev,
			search: {
				...prev.search,
				searching
			}
		})),
		searchError,
		setSearchError: (error) => setFeed((prev) => ({
			...prev,
			search: {
				...prev.search,
				error
			}
		})),
		searchRetryNonce,
		setSearchRetryNonce,
		previewConversations,
		setPreviewConversations: (value) => setFeed((prev) => ({
			...prev,
			previewData: {
				...prev.previewData,
				conversations: typeof value === "function" ? value(prev.previewData.conversations) : value
			}
		})),
		previewMessagesByConversation,
		setPreviewMessagesByConversation: (value) => setFeed((prev) => ({
			...prev,
			previewData: {
				...prev.previewData,
				messagesByConversation: typeof value === "function" ? value(prev.previewData.messagesByConversation) : value
			}
		})),
		previewReplyTimersRef,
		conversationsQuery,
		unreadCountQuery,
		typedMessagesQuery,
		conversations,
		currentMessages,
		visibleMessages,
		selectConversation,
		loadMoreMessages,
		retryDirectMessageSearch,
		normalizedMessageSearch,
		isLoadingConversations: isPreviewMode ? false : conversationsQuery === void 0,
		isLoadingMessages: isPreviewMode ? false : messagesQueryArgsChanged || typedMessagesQuery === void 0 && messageCursor === null,
		hasMoreMessages: isPreviewMode ? false : hasMore,
		messagesError: normalizedMessageSearch ? searchError : dmQueryError
	};
}
function buildPreviewMessageIndex(conversations) {
	const index = /* @__PURE__ */ new Map();
	for (const [conversationLegacyId, messages] of Object.entries(conversations)) for (let messageIndex = 0; messageIndex < messages.length; messageIndex += 1) {
		const message = messages[messageIndex];
		if (message) index.set(message.legacyId, {
			conversationLegacyId,
			index: messageIndex
		});
	}
	return index;
}
function useDirectMessageActions(options) {
	const { workspaceId, currentUserId, currentUserName, currentUserRole, isPreviewMode, selectedConversation, setSelectedConversation, isSending, setIsSending, previewConversations, setPreviewConversations, previewMessagesByConversation, setPreviewMessagesByConversation, previewReplyTimersRef, conversations, selectConversation, normalizedMessageSearch, searchError, unreadCountQuery } = options;
	const getOrCreateConversationMutation = useMutation(api$1.directMessages.getOrCreateConversation);
	const sendMessageMutation = useMutation(api$1.directMessages.sendMessage);
	const markAsReadMutation = useMutation(api$1.directMessages.markAsRead);
	const editMessageMutation = useMutation(api$1.directMessages.editMessage);
	const deleteMessageMutation = useMutation(api$1.directMessages.deleteMessage);
	const toggleReactionMutation = useMutation(api$1.directMessages.toggleReaction);
	const setArchiveStatusMutation = useMutation(api$1.directMessages.setArchiveStatus);
	const setMuteStatusMutation = useMutation(api$1.directMessages.setMuteStatus);
	const getOrCreateConversation = async (otherUserId, otherUserName, otherUserRole) => {
		if (isPreviewMode) {
			const existingConversation = previewConversations.find((conversation) => conversation.otherParticipantId === otherUserId);
			if (existingConversation) return {
				legacyId: existingConversation.legacyId,
				isNew: false
			};
			const legacyId = `preview-dm-${otherUserId}-${Date.now()}`;
			const newConversation = {
				id: legacyId,
				legacyId,
				otherParticipantId: otherUserId,
				otherParticipantName: otherUserName,
				otherParticipantRole: otherUserRole ?? null,
				lastMessageSnippet: null,
				lastMessageAtMs: null,
				lastMessageSenderId: null,
				isRead: true,
				isArchived: false,
				isMuted: false,
				createdAtMs: Date.now(),
				updatedAtMs: Date.now()
			};
			setPreviewConversations((prev) => [newConversation, ...prev]);
			setPreviewMessagesByConversation((prev) => ({
				...prev,
				[legacyId]: []
			}));
			return {
				legacyId,
				isNew: true
			};
		}
		if (!workspaceId) throw new Error("No workspace selected");
		try {
			const result = await getOrCreateConversationMutation({
				workspaceId: String(workspaceId),
				otherUserId,
				otherUserName,
				otherUserRole
			});
			return {
				legacyId: result.legacyId,
				isNew: result.isNew
			};
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useDirectMessages:getOrCreateConversation",
				title: "Unable to start conversation",
				fallbackMessage: "Unable to start conversation"
			});
			throw error;
		}
	};
	const startNewDM = async (user) => {
		const result = await getOrCreateConversation(user.id, user.name, user.role);
		selectConversation({
			id: result.legacyId,
			legacyId: result.legacyId,
			otherParticipantId: user.id,
			otherParticipantName: user.name,
			otherParticipantRole: user.role ?? null,
			lastMessageSnippet: null,
			lastMessageAtMs: null,
			lastMessageSenderId: null,
			isRead: true,
			isArchived: false,
			isMuted: false,
			createdAtMs: Date.now(),
			updatedAtMs: Date.now()
		});
	};
	const sendMessage = async (content, attachments) => {
		if (!selectedConversation || !isPreviewMode && !workspaceId) return;
		setIsSending(true);
		try {
			if (isPreviewMode) {
				const now = Date.now();
				const previewMessage = {
					id: `preview-dm-message-${now}`,
					legacyId: `preview-dm-message-${now}`,
					senderId: currentUserId ?? "preview-current-user",
					senderName: currentUserName?.trim() || "You",
					senderRole: currentUserRole ?? null,
					content,
					edited: false,
					editedAtMs: null,
					deleted: false,
					deletedAtMs: null,
					deletedBy: null,
					attachments: attachments ?? null,
					reactions: null,
					readBy: [currentUserId ?? "preview-current-user"],
					deliveredTo: [currentUserId ?? "preview-current-user", selectedConversation.otherParticipantId],
					readAtMs: now,
					sharedTo: null,
					createdAtMs: now,
					updatedAtMs: now
				};
				setPreviewMessagesByConversation((prev) => {
					const existing = prev[selectedConversation.legacyId] ?? [];
					return {
						...prev,
						[selectedConversation.legacyId]: [...existing, previewMessage].sort((a, b) => b.createdAtMs - a.createdAtMs)
					};
				});
				setPreviewConversations((prev) => [...prev].map((conversation) => conversation.legacyId === selectedConversation.legacyId ? {
					...conversation,
					lastMessageSnippet: formatConversationSnippet(content, 160),
					lastMessageAtMs: now,
					lastMessageSenderId: currentUserId ?? "preview-current-user",
					isRead: true,
					updatedAtMs: now
				} : conversation).sort((a, b) => (b.lastMessageAtMs ?? 0) - (a.lastMessageAtMs ?? 0)));
				if (typeof window !== "undefined") {
					const conversationSnapshot = selectedConversation;
					const timerId = window.setTimeout(() => {
						previewReplyTimersRef.current = previewReplyTimersRef.current.filter((id) => id !== timerId);
						const autoReply = getPreviewDirectAutoReply({
							conversationLegacyId: conversationSnapshot.legacyId,
							otherParticipantId: conversationSnapshot.otherParticipantId,
							otherParticipantName: conversationSnapshot.otherParticipantName,
							otherParticipantRole: conversationSnapshot.otherParticipantRole,
							content,
							currentUserId
						});
						setPreviewMessagesByConversation((prev) => {
							const existing = prev[conversationSnapshot.legacyId] ?? [];
							return {
								...prev,
								[conversationSnapshot.legacyId]: [...existing, autoReply].sort((a, b) => b.createdAtMs - a.createdAtMs)
							};
						});
						setPreviewConversations((prev) => [...prev].map((conversation) => conversation.legacyId === conversationSnapshot.legacyId ? {
							...conversation,
							lastMessageSnippet: formatConversationSnippet(autoReply.content, 160),
							lastMessageAtMs: autoReply.createdAtMs,
							lastMessageSenderId: autoReply.senderId,
							isRead: true,
							updatedAtMs: autoReply.updatedAtMs ?? autoReply.createdAtMs
						} : conversation).sort((a, b) => (b.lastMessageAtMs ?? 0) - (a.lastMessageAtMs ?? 0)));
					}, 900);
					previewReplyTimersRef.current.push(timerId);
				}
				return;
			}
			await sendMessageMutation({
				workspaceId: String(workspaceId),
				conversationLegacyId: selectedConversation.legacyId,
				content,
				attachments: attachments ?? null
			});
		} catch (error) {
			logError(error, "useDirectMessages:sendMessage");
			throw error;
		} finally {
			setIsSending(false);
		}
	};
	const markAsRead = (0, import_react.useEffectEvent)(async () => {
		if (!selectedConversation || !isPreviewMode && !workspaceId) return;
		if (isPreviewMode) {
			setPreviewConversations((prev) => prev.map((conversation) => conversation.legacyId === selectedConversation.legacyId ? {
				...conversation,
				isRead: true
			} : conversation));
			return;
		}
		try {
			await markAsReadMutation({
				workspaceId: String(workspaceId),
				conversationLegacyId: selectedConversation.legacyId
			});
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useDirectMessages:markAsRead",
				title: "Unable to mark read",
				fallbackMessage: "Unable to mark read"
			});
		}
	});
	const editMessage = async (messageLegacyId, newContent) => {
		if (isPreviewMode) {
			setPreviewMessagesByConversation((prev) => {
				const location = buildPreviewMessageIndex(prev).get(messageLegacyId);
				if (!location) return prev;
				const messages = prev[location.conversationLegacyId];
				const existingMessage = messages?.[location.index];
				if (!messages || !existingMessage) return prev;
				const updatedMessages = [...messages];
				updatedMessages[location.index] = {
					...existingMessage,
					content: newContent,
					edited: true,
					editedAtMs: Date.now(),
					updatedAtMs: Date.now()
				};
				return {
					...prev,
					[location.conversationLegacyId]: updatedMessages
				};
			});
			return;
		}
		if (!workspaceId) return;
		try {
			await editMessageMutation({
				workspaceId: String(workspaceId),
				messageLegacyId,
				newContent
			});
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useDirectMessages:editMessage",
				title: "Edit failed",
				fallbackMessage: "Edit failed"
			});
		}
	};
	const deleteMessage = async (messageLegacyId) => {
		if (isPreviewMode) {
			setPreviewMessagesByConversation((prev) => {
				const location = buildPreviewMessageIndex(prev).get(messageLegacyId);
				if (!location) return prev;
				const messages = prev[location.conversationLegacyId];
				const existingMessage = messages?.[location.index];
				if (!messages || !existingMessage) return prev;
				const updatedMessages = [...messages];
				updatedMessages[location.index] = {
					...existingMessage,
					content: "",
					deleted: true,
					deletedAtMs: Date.now(),
					deletedBy: currentUserId ?? "preview-current-user",
					updatedAtMs: Date.now()
				};
				return {
					...prev,
					[location.conversationLegacyId]: updatedMessages
				};
			});
			return;
		}
		if (!workspaceId) return;
		try {
			await deleteMessageMutation({
				workspaceId: String(workspaceId),
				messageLegacyId
			});
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useDirectMessages:deleteMessage",
				title: "Delete failed",
				fallbackMessage: "Delete failed"
			});
		}
	};
	const toggleReaction = async (messageLegacyId, emoji) => {
		if (isPreviewMode) {
			const reactionUserId = currentUserId ?? "preview-current-user";
			setPreviewMessagesByConversation((prev) => {
				const location = buildPreviewMessageIndex(prev).get(messageLegacyId);
				if (!location) return prev;
				const messages = prev[location.conversationLegacyId];
				const currentMessage = messages?.[location.index];
				if (!messages || !currentMessage) return prev;
				const currentReactions = currentMessage.reactions ?? [];
				const existingReaction = new Map(currentReactions.map((reaction) => [reaction.emoji, reaction])).get(emoji);
				let nextReactions = currentReactions;
				if (existingReaction) {
					const hasReacted = new Set(existingReaction.userIds).has(reactionUserId);
					nextReactions = currentReactions.flatMap((reaction) => {
						if (reaction.emoji !== emoji) return [reaction];
						const nextUserIds = hasReacted ? reaction.userIds.filter((entry) => entry !== reactionUserId) : [...reaction.userIds, reactionUserId];
						if (nextUserIds.length === 0) return [];
						return [{
							...reaction,
							count: nextUserIds.length,
							userIds: nextUserIds
						}];
					});
				} else nextReactions = [...currentReactions, {
					emoji,
					count: 1,
					userIds: [reactionUserId]
				}];
				const updatedMessages = [...messages];
				updatedMessages[location.index] = {
					...currentMessage,
					reactions: nextReactions,
					updatedAtMs: Date.now()
				};
				return {
					...prev,
					[location.conversationLegacyId]: updatedMessages
				};
			});
			return;
		}
		if (!workspaceId) return;
		try {
			await toggleReactionMutation({
				workspaceId: String(workspaceId),
				messageLegacyId,
				emoji
			});
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useDirectMessages:toggleReaction",
				title: "Reaction failed",
				fallbackMessage: "Reaction failed"
			});
		}
	};
	const archiveConversation = async (archived) => {
		if (!selectedConversation || !isPreviewMode && !workspaceId) return;
		if (isPreviewMode) {
			setPreviewConversations((prev) => prev.map((conversation) => conversation.legacyId === selectedConversation.legacyId ? {
				...conversation,
				isArchived: archived
			} : conversation));
			return;
		}
		try {
			await setArchiveStatusMutation({
				workspaceId: String(workspaceId),
				conversationLegacyId: selectedConversation.legacyId,
				archived
			});
			setSelectedConversation((prev) => prev ? {
				...prev,
				isArchived: archived
			} : null);
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useDirectMessages:archiveConversation",
				title: "Archive update failed",
				fallbackMessage: "Archive update failed"
			});
		}
	};
	const muteConversation = async (muted) => {
		if (!selectedConversation || !isPreviewMode && !workspaceId) return;
		if (isPreviewMode) {
			setPreviewConversations((prev) => prev.map((conversation) => conversation.legacyId === selectedConversation.legacyId ? {
				...conversation,
				isMuted: muted
			} : conversation));
			return;
		}
		try {
			await setMuteStatusMutation({
				workspaceId: String(workspaceId),
				conversationLegacyId: selectedConversation.legacyId,
				muted
			});
			setSelectedConversation((prev) => prev ? {
				...prev,
				isMuted: muted
			} : null);
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useDirectMessages:muteConversation",
				title: "Mute update failed",
				fallbackMessage: "Mute update failed"
			});
		}
	};
	const markedReadConversationRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!selectedConversation || selectedConversation.isRead) return;
		if (markedReadConversationRef.current === selectedConversation.legacyId) return;
		markedReadConversationRef.current = selectedConversation.legacyId;
		markAsRead();
	}, [selectedConversation]);
	return {
		sendMessage,
		isSending,
		markAsRead,
		editMessage,
		deleteMessage,
		toggleReaction,
		archiveConversation,
		muteConversation,
		getOrCreateConversation,
		unreadCount: isPreviewMode ? conversations.filter((conversation) => !conversation.isRead).length : unreadCountQuery ?? 0,
		startNewDM
	};
}
function useDmTyping({ workspaceId, currentUserId, currentUserName, currentUserRole, conversationLegacyId }) {
	const resolveSenderDetails = () => ({
		senderName: currentUserName?.trim() || "You",
		senderRole: currentUserRole ?? null
	});
	const { notifyTyping, handleComposerFocus, handleComposerBlur, stopTyping } = useTyping({
		workspaceId,
		conversationLegacyId,
		resolveSenderDetails
	});
	const { typingParticipants } = useRealtimeTyping({
		userId: currentUserId,
		workspaceId,
		conversationLegacyId
	});
	return {
		typingParticipants,
		notifyTyping,
		handleComposerFocus,
		handleComposerBlur,
		stopTyping
	};
}
function useDirectMessages(options) {
	const query = useDirectConversationsQuery(options);
	const actions = useDirectMessageActions({
		...options,
		...query
	});
	const dmTyping = useDmTyping({
		workspaceId: options.workspaceId,
		currentUserId: options.currentUserId,
		currentUserName: options.currentUserName,
		currentUserRole: options.currentUserRole,
		conversationLegacyId: query.selectedConversation?.legacyId ?? null
	});
	return {
		conversations: query.conversations,
		selectedConversation: query.selectedConversation,
		selectConversation: query.selectConversation,
		isLoadingConversations: query.isLoadingConversations,
		messages: query.currentMessages,
		visibleMessages: query.visibleMessages,
		isLoadingMessages: query.isLoadingMessages,
		isLoadingMore: query.isLoadingMore,
		loadMoreMessages: query.loadMoreMessages,
		hasMoreMessages: query.hasMoreMessages,
		messageSearchQuery: query.messageSearchQuery,
		setMessageSearchQuery: query.setMessageSearchQuery,
		searchHighlights: query.searchHighlights,
		searchingMessages: query.searchingMessages,
		messagesError: query.messagesError,
		retryMessagesError: query.retryDirectMessageSearch,
		sendMessage: actions.sendMessage,
		isSending: actions.isSending,
		markAsRead: actions.markAsRead,
		editMessage: actions.editMessage,
		deleteMessage: actions.deleteMessage,
		toggleReaction: actions.toggleReaction,
		archiveConversation: actions.archiveConversation,
		muteConversation: actions.muteConversation,
		getOrCreateConversation: actions.getOrCreateConversation,
		unreadCount: actions.unreadCount,
		startNewDM: actions.startNewDM,
		typingParticipants: dmTyping.typingParticipants,
		handleComposerFocus: dmTyping.handleComposerFocus,
		handleComposerBlur: dmTyping.handleComposerBlur,
		notifyDmTyping: dmTyping.notifyTyping
	};
}
function useCollaborationDashboardDialogs() {
	const [isNewDMDialogOpen, setIsNewDMDialogOpen] = (0, import_react.useState)(false);
	const [isManageMembersDialogOpen, setIsManageMembersDialogOpen] = (0, import_react.useState)(false);
	const openManageMembersDialog = () => {
		setIsManageMembersDialogOpen(true);
	};
	const openNewDMDialog = () => {
		setIsNewDMDialogOpen(true);
	};
	return {
		isManageMembersDialogOpen,
		isNewDMDialogOpen,
		openManageMembersDialog,
		openNewDMDialog,
		setIsManageMembersDialogOpen,
		setIsNewDMDialogOpen
	};
}
function clearChannelUrlParams(params) {
	params.delete("projectId");
	params.delete("projectName");
	params.delete("channelId");
	params.delete("channelType");
	params.delete("clientId");
}
function clearDmUrlParams(params) {
	params.delete("conversationId");
}
function useCollaborationDashboardUrlState({ channels, dmConversations, selectedChannelId, selectedConversationLegacyId, isChannelsReady, isDmReady, selectChannel, selectConversation }) {
	const searchParams = useUrlSearchParamsContext();
	const router = useRouter$1();
	const pathname = usePathname();
	const projectParamHandledRef = (0, import_react.useRef)(null);
	const channelParamHandledRef = (0, import_react.useRef)(null);
	const dmParamHandledRef = (0, import_react.useRef)(null);
	const requestedProjectId = searchParams.get("projectId");
	const requestedProjectName = searchParams.get("projectName");
	const requestedChannelId = searchParams.get("channelId");
	const requestedChannelType = searchParams.get("channelType");
	const requestedClientId = searchParams.get("clientId");
	const requestedConversationId = searchParams.get("conversationId");
	const requestedMessageId = searchParams.get("messageId");
	const requestedThreadId = searchParams.get("threadId");
	const replaceSearchParams = (0, import_react.useCallback)((mutate) => {
		const params = new URLSearchParams(searchParams.toString());
		mutate(params);
		const next = params.toString();
		router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
	}, [
		pathname,
		router,
		searchParams
	]);
	const hasUrlChannelParams = Boolean(requestedProjectId || requestedChannelId || requestedChannelType || requestedClientId);
	const hasUrlDmParam = Boolean(requestedConversationId);
	const targetConversation = (() => {
		if (!requestedConversationId) return null;
		return dmConversations.find((conversation) => conversation.legacyId === requestedConversationId) ?? null;
	})();
	const paramSignature = [
		requestedProjectId ?? "",
		requestedProjectName ?? "",
		requestedChannelId ?? "",
		requestedChannelType ?? "",
		requestedClientId ?? ""
	].join("|");
	const targetChannel = (() => {
		if (!hasUrlChannelParams) return null;
		const normalizedName = requestedProjectName?.toLowerCase() ?? null;
		return (requestedChannelId ? channels.find((channel) => channel.id === requestedChannelId) : void 0) ?? (requestedChannelType === "team" ? channels.find((channel) => channel.type === "team") : void 0) ?? (requestedChannelType === "client" && requestedClientId ? channels.find((channel) => channel.type === "client" && channel.clientId === requestedClientId) : void 0) ?? (requestedClientId ? channels.find((channel) => channel.type === "client" && channel.clientId === requestedClientId) : void 0) ?? (requestedChannelType === "project" && requestedProjectId ? channels.find((channel) => channel.type === "project" && channel.projectId === requestedProjectId) : void 0) ?? (requestedProjectId ? channels.find((channel) => channel.type === "project" && channel.projectId === requestedProjectId) : void 0) ?? (normalizedName ? channels.find((channel) => channel.type === "project" && channel.name.toLowerCase() === normalizedName) : void 0) ?? null;
	})();
	const unresolvedChannelUrl = isChannelsReady && hasUrlChannelParams && targetChannel === null && !hasUrlDmParam;
	const unresolvedConversationUrl = isDmReady && hasUrlDmParam && targetConversation === null;
	const clearProjectFilter = (0, import_react.useCallback)(() => {
		replaceSearchParams((params) => {
			params.delete("projectId");
			params.delete("projectName");
		});
	}, [replaceSearchParams]);
	const clearMessageFocus = (0, import_react.useCallback)(() => {
		if (!requestedMessageId && !requestedThreadId) return;
		replaceSearchParams((params) => {
			params.delete("messageId");
			params.delete("threadId");
		});
	}, [
		replaceSearchParams,
		requestedMessageId,
		requestedThreadId
	]);
	(0, import_react.useEffect)(() => {
		if (!hasUrlChannelParams) {
			projectParamHandledRef.current = null;
			channelParamHandledRef.current = null;
			return;
		}
		if (!isChannelsReady || !targetChannel) return;
		if (projectParamHandledRef.current === paramSignature || channelParamHandledRef.current === paramSignature) return;
		if (targetChannel.id !== selectedChannelId || selectedConversationLegacyId) {
			clearMessageFocus();
			selectConversation(null);
			selectChannel(targetChannel.id);
			replaceSearchParams((params) => {
				clearDmUrlParams(params);
			});
		}
		projectParamHandledRef.current = paramSignature;
		channelParamHandledRef.current = paramSignature;
	}, [
		clearMessageFocus,
		hasUrlChannelParams,
		isChannelsReady,
		paramSignature,
		replaceSearchParams,
		selectChannel,
		selectConversation,
		selectedChannelId,
		selectedConversationLegacyId,
		targetChannel
	]);
	(0, import_react.useEffect)(() => {
		if (!hasUrlDmParam || !requestedConversationId) {
			dmParamHandledRef.current = null;
			return;
		}
		if (!isDmReady || !targetConversation) return;
		if (dmParamHandledRef.current === requestedConversationId) return;
		if (selectedConversationLegacyId !== targetConversation.legacyId || selectedChannelId) {
			if (!requestedMessageId) clearMessageFocus();
			selectChannel(null);
			selectConversation(targetConversation);
			replaceSearchParams((params) => {
				clearChannelUrlParams(params);
			});
		}
		dmParamHandledRef.current = requestedConversationId;
	}, [
		clearMessageFocus,
		hasUrlDmParam,
		requestedMessageId,
		isDmReady,
		replaceSearchParams,
		requestedConversationId,
		selectChannel,
		selectConversation,
		selectedChannelId,
		selectedConversationLegacyId,
		targetConversation
	]);
	const dismissUnresolvedChannelUrl = () => {
		replaceSearchParams((params) => {
			clearChannelUrlParams(params);
		});
	};
	const dismissUnresolvedConversationUrl = () => {
		replaceSearchParams((params) => {
			clearDmUrlParams(params);
		});
	};
	const handleOpenChannelMessage = (messageId, options) => {
		const normalizedMessageId = typeof messageId === "string" ? messageId.trim() : "";
		if (!normalizedMessageId) return;
		const normalizedThreadId = typeof options?.threadId === "string" && options.threadId.trim().length > 0 ? options.threadId.trim() : null;
		replaceSearchParams((params) => {
			params.set("messageId", normalizedMessageId);
			if (normalizedThreadId) params.set("threadId", normalizedThreadId);
			else params.delete("threadId");
			clearDmUrlParams(params);
		});
	};
	const handleOpenDmMessage = (messageId) => {
		const normalizedMessageId = typeof messageId === "string" ? messageId.trim() : "";
		if (!normalizedMessageId) return;
		replaceSearchParams((params) => {
			params.set("messageId", normalizedMessageId);
			params.delete("threadId");
			clearChannelUrlParams(params);
		});
	};
	const syncChannelToUrl = (channelId) => {
		replaceSearchParams((params) => {
			params.set("channelId", channelId);
			clearDmUrlParams(params);
			params.delete("messageId");
			params.delete("threadId");
		});
	};
	const syncDmToUrl = (conversationLegacyId) => {
		replaceSearchParams((params) => {
			params.set("conversationId", conversationLegacyId);
			clearChannelUrlParams(params);
			params.delete("messageId");
			params.delete("threadId");
		});
	};
	const clearCollaborationSelectionFromUrl = () => {
		replaceSearchParams((params) => {
			clearChannelUrlParams(params);
			clearDmUrlParams(params);
			params.delete("messageId");
			params.delete("threadId");
		});
	};
	return {
		clearCollaborationSelectionFromUrl,
		clearMessageFocus,
		clearProjectFilter,
		dismissUnresolvedChannelUrl,
		dismissUnresolvedConversationUrl,
		handleOpenChannelMessage,
		handleOpenDmMessage,
		syncChannelToUrl,
		syncDmToUrl,
		requestedConversationId,
		requestedMessageId,
		requestedProjectId,
		requestedProjectName,
		requestedThreadId,
		unresolvedChannelUrl,
		unresolvedConversationUrl
	};
}
function useCollaborationDashboardActions({ clearCollaborationSelectionFromUrl, clearMessageFocus, clearPendingAttachments, syncChannelToUrl, syncDmToUrl, closeManageMembersDialog, closeNewDMDialog, createChannel, removeChannel, selectedChannel, selectedConversation, selectedCustomChannel, selectChannel, selectConversation, startNewDM, updateChannelMembers, workspaceId }) {
	const handleStartNewDM = async (targetUser) => {
		await startNewDM(targetUser);
		closeNewDMDialog();
	};
	const handleSelectDM = (conversation) => {
		clearMessageFocus();
		clearPendingAttachments?.();
		if (conversation) {
			selectChannel(null);
			syncDmToUrl?.(conversation.legacyId);
		} else clearCollaborationSelectionFromUrl?.();
		selectConversation(conversation);
	};
	const handleSelectChannel = (channelId) => {
		clearMessageFocus();
		clearPendingAttachments?.();
		if (channelId) {
			syncChannelToUrl?.(channelId);
			if (selectedConversation) selectConversation(null);
		} else clearCollaborationSelectionFromUrl?.();
		selectChannel(channelId);
	};
	const handleCreateChannel = async (channel) => {
		if (!workspaceId) throw new Error("Workspace unavailable");
		const created = await createChannel({
			workspaceId,
			name: channel.name,
			description: channel.description ?? null,
			visibility: channel.visibility,
			memberIds: channel.memberIds
		});
		if (typeof created?.legacyId === "string") selectChannel(created.legacyId);
	};
	const handleSaveChannelMembers = async (payload) => {
		if (!workspaceId || !selectedCustomChannel) return;
		try {
			await updateChannelMembers({
				workspaceId,
				legacyId: selectedCustomChannel.id,
				memberIds: payload.memberIds,
				visibility: payload.visibility
			});
			notifySuccess({
				title: "Channel updated",
				message: `Access for #${selectedCustomChannel.name} has been updated.`
			});
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useCollaborationDashboardActions:handleSaveChannelMembers",
				title: "Update failed",
				fallbackMessage: "Update failed"
			});
			throw error;
		}
	};
	const handleDeleteChannel = async () => {
		if (!workspaceId || !selectedCustomChannel) return;
		try {
			await removeChannel({
				workspaceId,
				legacyId: selectedCustomChannel.id
			});
			closeManageMembersDialog();
			selectChannel("team-agency");
			notifySuccess({
				title: "Channel deleted",
				message: `#${selectedCustomChannel.name} has been removed from collaboration.`
			});
		} catch (error) {
			reportConvexFailure({
				error,
				context: "useCollaborationDashboardActions:handleDeleteChannel",
				title: "Delete failed",
				fallbackMessage: "Delete failed"
			});
			throw error;
		}
	};
	return {
		handleCreateChannel,
		handleDeleteChannel,
		handleSaveChannelMembers,
		handleSelectChannel,
		handleSelectDM,
		handleStartNewDM
	};
}
var CollaborationDashboardContext = (0, import_react.createContext)(null);
function CollaborationDashboardProvider({ children }) {
	const dialogs = useCollaborationDashboardDialogs();
	const { user } = useAuth();
	const workspaceId = user?.agencyId ? String(user.agencyId) : null;
	const currentUserId = user?.id ?? null;
	const currentUserName = user?.name?.trim() || user?.email?.trim() || "You";
	const currentUserRole = user?.role ?? null;
	const isAdmin = currentUserRole === "admin";
	const workspaceMembersResult = useQuery(usersApi.listWorkspaceMembers, workspaceId ? {
		workspaceId,
		limit: 500
	} : "skip");
	const createChannel = useMutation(collaborationChannelsApi.create);
	const updateChannelMembers = useMutation(collaborationChannelsApi.updateMembers);
	const removeChannel = useMutation(collaborationChannelsApi.remove);
	const collab = useCollaborationData();
	const dm = useDirectMessages({
		workspaceId,
		currentUserId,
		currentUserName,
		currentUserRole
	});
	const clearThreadReplies = collab.clearThreadReplies;
	const selectedChannelId = collab.selectedChannel?.id ?? null;
	const collabSelectedChannelId = collab.selectedChannel?.id ?? null;
	const selectCollabChannel = collab.selectChannel;
	const selectedCustomChannel = collab.selectedChannel?.isCustom ? collab.selectedChannel : null;
	const workspaceMembers = (workspaceMembersResult ?? []).flatMap((member) => typeof member?.id === "string" && typeof member?.name === "string" ? [{
		id: member.id,
		name: member.name,
		email: typeof member.email === "string" ? member.email : void 0,
		role: typeof member.role === "string" ? member.role : void 0
	}] : []);
	const urlState = useCollaborationDashboardUrlState({
		channels: collab.channels,
		dmConversations: dm.conversations,
		selectedChannelId: collabSelectedChannelId,
		selectedConversationLegacyId: dm.selectedConversation?.legacyId ?? null,
		isChannelsReady: !collab.isBootstrapping,
		isDmReady: !dm.isLoadingConversations,
		selectChannel: selectCollabChannel,
		selectConversation: dm.selectConversation
	});
	(0, import_react.useEffect)(() => {
		if (selectedChannelId === null) {
			clearThreadReplies();
			return;
		}
		clearThreadReplies();
	}, [clearThreadReplies, selectedChannelId]);
	const actions = useCollaborationDashboardActions({
		clearCollaborationSelectionFromUrl: urlState.clearCollaborationSelectionFromUrl,
		clearMessageFocus: urlState.clearMessageFocus,
		clearPendingAttachments: collab.clearPendingAttachments,
		syncChannelToUrl: urlState.syncChannelToUrl,
		syncDmToUrl: urlState.syncDmToUrl,
		closeManageMembersDialog: () => dialogs.setIsManageMembersDialogOpen(false),
		closeNewDMDialog: () => dialogs.setIsNewDMDialogOpen(false),
		createChannel,
		removeChannel,
		selectedChannel: collab.selectedChannel,
		selectedConversation: dm.selectedConversation,
		selectedCustomChannel,
		selectChannel: selectCollabChannel,
		selectConversation: dm.selectConversation,
		startNewDM: dm.startNewDM,
		updateChannelMembers,
		workspaceId
	});
	const value = {
		collab,
		dm,
		currentUserId,
		currentUserRole,
		isAdmin,
		isManageMembersDialogOpen: dialogs.isManageMembersDialogOpen,
		isNewDMDialogOpen: dialogs.isNewDMDialogOpen,
		requestedMessageId: urlState.requestedMessageId,
		requestedConversationId: urlState.requestedConversationId,
		requestedProjectId: urlState.requestedProjectId,
		requestedProjectName: urlState.requestedProjectName,
		requestedThreadId: urlState.requestedThreadId,
		unresolvedChannelUrl: urlState.unresolvedChannelUrl,
		unresolvedConversationUrl: urlState.unresolvedConversationUrl,
		dismissUnresolvedChannelUrl: urlState.dismissUnresolvedChannelUrl,
		dismissUnresolvedConversationUrl: urlState.dismissUnresolvedConversationUrl,
		selectedCustomChannel,
		workspaceId,
		workspaceMembers,
		clearMessageFocus: urlState.clearMessageFocus,
		clearProjectFilter: urlState.clearProjectFilter,
		handleCreateChannel: actions.handleCreateChannel,
		handleDeleteChannel: actions.handleDeleteChannel,
		handleOpenChannelMessage: urlState.handleOpenChannelMessage,
		handleOpenDmMessage: urlState.handleOpenDmMessage,
		handleSaveChannelMembers: actions.handleSaveChannelMembers,
		handleSelectChannel: actions.handleSelectChannel,
		handleSelectDM: actions.handleSelectDM,
		handleStartNewDM: actions.handleStartNewDM,
		openManageMembersDialog: dialogs.openManageMembersDialog,
		openNewDMDialog: dialogs.openNewDMDialog,
		setIsManageMembersDialogOpen: dialogs.setIsManageMembersDialogOpen,
		setIsNewDMDialogOpen: dialogs.setIsNewDMDialogOpen
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollaborationDashboardContext.Provider, {
		value,
		children
	});
}
function useCollaborationDashboardContext() {
	const context = (0, import_react.use)(CollaborationDashboardContext);
	if (!context) throw new Error("useCollaborationDashboardContext must be used within a CollaborationDashboardProvider");
	return context;
}
/** Returns the previous render's `value` (undefined on first render). */
function usePrevious(value) {
	const valueRef = (0, import_react.useRef)(value);
	const [previous, setPrevious] = (0, import_react.useState)(void 0);
	(0, import_react.useEffect)(() => {
		setPrevious(valueRef.current);
		valueRef.current = value;
	}, [value]);
	return previous;
}
var SOURCE_ICONS = {
	direct_message: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" }),
	channel: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, { className: "size-4" })
};
function getInitials$2(name) {
	if (!name) return "?";
	return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}
function ConversationListPane({ channelCount, dmCount, filteredItems, isLoading, isSelected, onNewDM, onSearchQueryChange, onSelectItem, onSourceFilterChange, searchQuery, sourceFilter, totalUnread, className }) {
	const searchInputRef = (0, import_react.useRef)(null);
	const previousUnread = usePrevious(totalUnread);
	const handleSearchChange = (event) => {
		onSearchQueryChange(event.target.value);
	};
	const handleSourceFilterChange = (value) => {
		onSourceFilterChange(value);
	};
	const createSelectItemHandler = (item) => () => {
		onSelectItem(item);
	};
	const selectInboxItem = (0, import_react.useEffectEvent)(onSelectItem);
	(0, import_react.useEffect)(() => {
		const onGlobalKeyDown = (event) => {
			const target = event.target;
			const tag = target?.tagName;
			const inEditableField = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable;
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				if (inEditableField) return;
				event.preventDefault();
				searchInputRef.current?.focus();
				searchInputRef.current?.select();
				return;
			}
			if (inEditableField || filteredItems.length === 0) return;
			const selectedIndex = filteredItems.findIndex((item) => isSelected(item));
			if (event.key === "ArrowDown") {
				event.preventDefault();
				selectInboxItem(filteredItems[selectedIndex < filteredItems.length - 1 ? selectedIndex + 1 : 0]);
				return;
			}
			if (event.key === "ArrowUp") {
				event.preventDefault();
				selectInboxItem(filteredItems[selectedIndex > 0 ? selectedIndex - 1 : filteredItems.length - 1]);
			}
		};
		window.addEventListener("keydown", onGlobalKeyDown);
		return () => window.removeEventListener("keydown", onGlobalKeyDown);
	}, [filteredItems, isSelected]);
	const unreadAnnouncement = (() => {
		if (isLoading || previousUnread === void 0) return "";
		if (totalUnread > previousUnread) {
			const newMessages = totalUnread - previousUnread;
			return `${newMessages} new ${newMessages === 1 ? "message has" : "messages have"} arrived. ${totalUnread} unread ${totalUnread === 1 ? "conversation" : "conversations"} in inbox.`;
		}
		if (totalUnread === 0 && previousUnread > 0) return "All inbox conversations are marked as read.";
		return "";
	})();
	const showRecentLabel = sourceFilter === "all" && !searchQuery.trim();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex h-full min-h-0 w-full flex-col overflow-hidden border-b border-muted/40 bg-muted/15 max-lg:min-h-[min(72dvh,640px)] lg:w-[min(100%,20rem)] lg:border-b-0 lg:border-r", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveRegion, { message: unreadAnnouncement }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 border-b border-muted/30 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-primary ring-1 ring-primary/15",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "truncate text-sm font-semibold tracking-tight",
										children: "Inbox"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground",
										children: "Channels & direct messages"
									})]
								}),
								totalUnread > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "default",
									className: "h-5 shrink-0 px-1.5 text-xs",
									"aria-label": `${totalUnread} unread ${totalUnread === 1 ? "conversation" : "conversations"}`,
									children: totalUnread
								}) : null
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: onNewDM,
							title: "New direct message",
							"aria-label": "Start a new direct message",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								ref: searchInputRef,
								value: searchQuery,
								onChange: handleSearchChange,
								placeholder: "Search conversations…",
								className: "pl-9 pr-14",
								"aria-label": "Search conversations"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none rounded border border-muted/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline",
								children: "⌘/Ctrl K"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
						value: sourceFilter,
						onValueChange: handleSourceFilterChange,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
							className: "flex h-auto w-full flex-wrap gap-0.5 bg-muted/50 p-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
									value: "all",
									className: "flex-1 text-xs data-[state=active]:shadow-sm",
									children: ["All ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										className: "ml-1 h-4 px-1 text-[10px]",
										children: channelCount + dmCount
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
									value: "channel",
									className: "flex-1 text-xs data-[state=active]:shadow-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, { className: "mr-0.5 size-3" }), channelCount]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
									value: "direct_message",
									className: "flex-1 text-xs data-[state=active]:shadow-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "mr-0.5 size-3" }), dmCount]
								})
							]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "min-h-0 w-full max-w-full flex-1 overflow-x-hidden",
				children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("output", {
					className: "block space-y-3 p-4",
					"aria-live": "polite",
					"aria-busy": "true",
					"aria-label": "Loading conversations",
					children: [
						"inbox-skeleton-1",
						"inbox-skeleton-2",
						"inbox-skeleton-3",
						"inbox-skeleton-4",
						"inbox-skeleton-5"
					].map((slotKey) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-10 shrink-0 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-24" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-32" })]
						})]
					}, slotKey))
				}) : filteredItems.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "mx-auto mb-3 size-12 text-muted-foreground/40" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: searchQuery ? "No conversations match your search." : sourceFilter === "channel" ? "No channels yet." : sourceFilter === "direct_message" ? "No direct messages yet." : "No conversations yet."
						}),
						sourceFilter === "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							className: "mt-3",
							onClick: onNewDM,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), "Start a conversation"]
						}) : sourceFilter === "direct_message" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							className: "mt-3",
							onClick: onNewDM,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), "Start a direct message"]
						}) : null
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1 p-2",
					children: [showRecentLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-2 pb-1 pt-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/90",
							children: "Recent"
						})
					}) : null, filteredItems.map((item) => {
						const hasUnread = !item.isRead || item.unreadCount > 0;
						const selected = isSelected(item);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-current": selected ? "true" : void 0,
							onClick: createSelectItemHandler(item),
							className: cn(CHAT_CONVERSATION_ROW_CLASS, "cv-scroll-item-compact", chromaticTransitionClass, "hover:bg-muted/60", selected && "border border-accent/25 bg-accent/8 shadow-sm ring-1 ring-primary/10", hasUnread && !selected && "bg-muted/25"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
									className: "size-10 shrink-0",
									children: [item.type === "channel" && item.metadata.channelAvatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
										src: item.metadata.channelAvatarUrl,
										alt: item.name,
										className: "object-cover"
									}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
										className: cn("text-xs font-medium", hasUnread && "bg-accent/10 text-primary", item.type === "channel" && "bg-muted"),
										children: item.type === "channel" ? SOURCE_ICONS.channel : getInitials$2(item.name)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("truncate text-sm", hasUnread ? "font-semibold" : "font-medium", selected && "text-primary"),
											children: item.name
										}), item.lastMessageAtMs ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientRelativeTime, {
											value: item.lastMessageAtMs,
											className: "shrink-0 text-[10px] text-muted-foreground"
										}) : null]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-0.5 flex min-w-0 items-center gap-1.5 overflow-hidden",
										children: [item.type === "channel" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											className: cn("h-4 shrink-0 px-1 py-0 text-[10px]", CHANNEL_TYPE_COLORS[item.metadata.channelType || "team"]),
											children: item.metadata.channelType || "channel"
										}) : item.metadata.otherParticipantRole ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											className: "h-4 shrink-0 px-1 py-0 text-[10px]",
											children: item.metadata.otherParticipantRole
										}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: CHAT_LIST_PREVIEW_CLASS,
											title: item.lastMessageSnippet ?? void 0,
											children: item.lastMessageSnippet ? formatConversationSnippet(item.lastMessageSnippet) : "No messages yet"
										})]
									})]
								}),
								hasUnread ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex shrink-0 items-center gap-1",
									children: [item.unreadCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "default",
										className: "h-5 px-1.5 text-xs",
										children: item.unreadCount
									}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-2 rounded-full bg-primary" })]
								}) : null
							]
						}, `${item.type}-${item.legacyId}`);
					})]
				})
			})
		]
	});
}
function collaborationToUnifiedMessage(msg) {
	return {
		id: msg.id,
		senderId: msg.senderId,
		senderName: msg.senderName,
		senderRole: msg.senderRole,
		content: msg.content ?? "",
		createdAtMs: msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now(),
		edited: msg.isEdited,
		deleted: msg.isDeleted,
		reactions: msg.reactions ?? void 0,
		attachments: msg.attachments?.map((a) => ({
			url: a.url,
			name: a.name,
			mimeType: a.type ?? void 0,
			size: a.size ? parseInt(a.size, 10) : void 0
		})) ?? void 0,
		sharedTo: msg.sharedTo ?? void 0,
		mentions: msg.mentions ?? void 0,
		threadRootId: msg.threadRootId ?? void 0,
		threadReplyCount: msg.threadReplyCount ?? void 0,
		threadLastReplyAt: msg.threadLastReplyAt ?? void 0,
		isPinned: msg.isPinned ?? void 0,
		deletedBy: msg.deletedBy ?? void 0,
		deletedAt: msg.deletedAt ?? void 0,
		readBy: msg.readBy ?? void 0,
		deliveredTo: msg.deliveredTo ?? void 0
	};
}
function MessageSearchBar({ value, onChange, resultCount, isActive, placeholder = "Search messages…", onClear, inputRef }) {
	const showClear = Boolean(value.trim() && onClear);
	const handleKeyDown = (event) => {
		if (event.key === "Escape" && value.trim().length > 0) {
			event.preventDefault();
			onClear?.();
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border-b border-muted/40 bg-muted/5 px-3 py-2 sm:px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					ref: inputRef,
					value,
					onChange,
					onKeyDown: handleKeyDown,
					placeholder,
					className: cn("pl-9", showClear && isActive ? "pr-32" : showClear ? "pr-24" : isActive ? "pr-20" : "pr-12"),
					"aria-label": placeholder
				}),
				!showClear ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("pointer-events-none absolute top-1/2 hidden -translate-y-1/2 select-none rounded border border-muted/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline", isActive ? "right-11" : "right-2"),
					children: "/"
				}) : null,
				showClear ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "icon",
					className: "absolute right-2 top-1/2 size-7 -translate-y-1/2 text-muted-foreground hover:text-foreground",
					onClick: onClear,
					"aria-label": "Clear message search",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
				}) : null,
				isActive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("pointer-events-none absolute top-1/2 -translate-y-1/2 text-xs tabular-nums text-muted-foreground", showClear ? "right-11" : "right-3"),
					children: [
						resultCount,
						" ",
						resultCount === 1 ? "result" : "results"
					]
				})
			]
		})
	});
}
function EmptyMessagesState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center justify-center rounded-lg border border-dashed border-muted/50 bg-muted/10 p-8 text-center",
		role: "status",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 rounded-full bg-muted/30 p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-6 text-muted-foreground/50" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: "mb-1 text-sm font-semibold text-foreground",
				children: "No messages yet"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-xs text-xs leading-relaxed text-muted-foreground",
				children: "Start the conversation by sending the first message."
			})
		]
	});
}
function NoSearchResultsState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center justify-center rounded-lg border border-dashed border-muted/50 bg-muted/10 p-8 text-center",
		role: "status",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 rounded-full bg-muted/30 p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-6 text-muted-foreground/50" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: "mb-1 text-sm font-semibold text-foreground",
				children: "No results found"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-xs text-xs leading-relaxed text-muted-foreground",
				children: "No messages match your search. Try different keywords or clear the search."
			})
		]
	});
}
function MessagesErrorState({ error, onRetry, isRetrying, retryLabel = "Try again" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive",
		role: "alert",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "min-w-0 flex-1",
				children: error
			}), onRetry ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "outline",
				size: "sm",
				onClick: onRetry,
				disabled: isRetrying,
				className: "shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive",
				children: [isRetrying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : null, retryLabel]
			}) : null]
		})
	});
}
function PollCardHeader({ isExpired, poll, totalVotes }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border-b bg-muted/50 p-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "mt-0.5 size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: poll.question
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 flex items-center gap-2 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							totalVotes,
							" ",
							totalVotes === 1 ? "vote" : "votes"
						] }),
						poll.endTime ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn(isExpired && "text-destructive"),
							children: isExpired ? "Ended" : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								"Ends",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientFormattedDate, {
									value: poll.endTime,
									formatStr: "PPp"
								})
							] })
						})] }) : null,
						poll.anonymous ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Anonymous" })] }) : null,
						poll.multipleChoice ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Multiple choices" })] }) : null
					]
				})]
			})]
		})
	});
}
function PollOptionRow({ ui, handleToggleOption, option, percentage, sortedOptions, voteCount }) {
	const { canVote, selected: isSelected, showResults: showOptionResults, hasLeadingWinner } = ui;
	const interactive = !showOptionResults && canVote;
	const barStyle = { width: `${percentage}%` };
	const handleRowClick = () => {
		if (interactive) handleToggleOption(option.id);
	};
	const handleCheckboxChange = () => {
		handleToggleOption(option.id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: cn("relative rounded-lg border p-3 transition-colors", interactive && "cursor-pointer hover:bg-background", isSelected && "border-primary bg-accent/5", showOptionResults && hasLeadingWinner && percentage > 0 && "border-accent/50"),
		onClick: handleRowClick,
		disabled: !interactive,
		children: [showOptionResults && percentage > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 -z-10 rounded-lg bg-accent/5",
			style: barStyle
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [
				!showOptionResults ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pt-0.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
						checked: isSelected,
						onChange: handleCheckboxChange
					})
				}) : null,
				showOptionResults && hasLeadingWinner && voteCount > 0 && voteCount > (sortedOptions[1]?.voters.length ?? 0) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 text-primary" }) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: option.text
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex items-center gap-2",
						children: [showOptionResults ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: percentage,
								className: "h-2"
							})
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "whitespace-nowrap text-xs text-muted-foreground",
							children: showOptionResults ? `${voteCount} ${voteCount === 1 ? "vote" : "votes"} (${percentage.toFixed(0)}%)` : `${voteCount} ${voteCount === 1 ? "vote" : "votes"}`
						})]
					})]
				})
			]
		})]
	});
}
function PollCardFooterActions({ ui, onEndPoll, onShowResults, onVote, selectedOptionsCount }) {
	const { canEnd, canVote, hasVoted, isExpired, isVoting, showResults } = ui;
	if (!(canVote && !hasVoted && !isExpired || canEnd)) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between border-t bg-muted/50 p-3",
		children: [
			canVote && !hasVoted && !isExpired ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "sm",
				onClick: onVote,
				disabled: selectedOptionsCount === 0 || isVoting,
				children: isVoting ? "Submitting..." : "Submit Vote"
			}) : null,
			canEnd && !isExpired ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "sm",
				variant: "outline",
				onClick: onEndPoll,
				children: "End Poll"
			}) : null,
			hasVoted && !showResults ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "sm",
				variant: "ghost",
				onClick: onShowResults,
				children: "View Results"
			}) : null
		]
	});
}
function CreatePollDialogTrigger({ trigger }) {
	if (trigger) return trigger;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			className: "gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-4" }), "Create Poll"]
		})
	});
}
function CreatePollDialogHeader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-5" }), "Create Poll"]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Create a poll to gather team feedback or make decisions." })] });
}
function CreatePollFormFields({ onAddOption, onOptionChange, onQuestionChange, onRemoveOption, options, question }) {
	const handleQuestionChange = (event) => {
		onQuestionChange(event.target.value);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 py-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: "question",
				children: "Question *"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				id: "question",
				placeholder: "What do you want to ask?",
				value: question,
				onChange: handleQuestionChange,
				maxLength: 200
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Options *" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: options.map((option, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatePollOptionRow, {
						index,
						option,
						optionsLength: options.length,
						onOptionChange,
						onRemoveOption
					}, option.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					onClick: onAddOption,
					className: "w-full",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 size-4" }), "Add Option"]
				})
			]
		})]
	});
}
function CreatePollSettings({ anonymous, multipleChoice, onAnonymousChange, onMultipleChoiceChange }) {
	const handleAnonymousChange = (checked) => {
		onAnonymousChange(checked === true);
	};
	const handleMultipleChoiceChange = (checked) => {
		onMultipleChoiceChange(checked === true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Allow multiple selections" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Users can select more than one option"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
				checked: multipleChoice,
				onCheckedChange: handleMultipleChoiceChange
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Anonymous votes" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Hide who voted for each option"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
				checked: anonymous,
				onCheckedChange: handleAnonymousChange
			})]
		})]
	});
}
function CreatePollOptionRow({ index, option, optionsLength, onOptionChange, onRemoveOption }) {
	const handleOptionChange = (event) => {
		onOptionChange(option.id, event.target.value);
	};
	const handleRemoveOption = () => {
		onRemoveOption(option.id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "w-6 text-sm text-muted-foreground",
				children: [index + 1, "."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: `Option ${index + 1}`,
				value: option.text,
				onChange: handleOptionChange,
				className: "flex-1"
			}),
			optionsLength > 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "ghost",
				size: "icon",
				className: "size-8",
				onClick: handleRemoveOption,
				"aria-label": `Remove option ${index + 1}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "sr-only",
					children: ["Remove option ", index + 1]
				})]
			}) : null
		]
	});
}
function CreatePollDialogFooter({ isCreating, onCancel, onCreate, question }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		variant: "outline",
		onClick: onCancel,
		disabled: isCreating,
		children: "Cancel"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		onClick: onCreate,
		disabled: isCreating || !question.trim(),
		children: isCreating ? "Creating…" : "Create Poll"
	})] });
}
function QuickPollTrigger() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		variant: "ghost",
		size: "icon",
		className: "size-7",
		"aria-label": "Create poll",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Create poll"
		})]
	});
}
var CREATE_POLL_DEFAULT_TRIGGER = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatePollDialogTrigger, {});
function PollOptionRowItem({ flags, handleToggleOption, index, option, selectedOptions, sortedOptions, totalVotes }) {
	const { canVote, hasVoted, isExpired, showResults } = flags;
	const voteCount = option.voters.length;
	const percentage = totalVotes > 0 ? voteCount / totalVotes * 100 : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PollOptionRow, {
		ui: {
			canVote,
			selected: selectedOptions.includes(option.id),
			showResults: showResults || hasVoted || isExpired || !canVote,
			hasLeadingWinner: index === 0
		},
		handleToggleOption,
		option,
		percentage,
		sortedOptions,
		voteCount
	});
}
/**
* Display a poll with voting functionality
*/
function PollCard({ poll, userId, onVote, onEndPoll, canVote = true, canEnd = false, showResults: showResultsProp, className }) {
	const [selectedOptions, setSelectedOptions] = (0, import_react.useState)([]);
	const [isVoting, setIsVoting] = (0, import_react.useState)(false);
	const [showResults, setShowResults] = (0, import_react.useState)(showResultsProp ?? false);
	const hasVoted = (() => {
		if (!userId) return [];
		return poll.options.filter((opt) => opt.voters.includes(userId));
	})().length > 0;
	const totalVotes = poll.options.reduce((sum, opt) => sum + opt.voters.length, 0);
	const sortedOptions = poll.options.toSorted((a, b) => b.voters.length - a.voters.length);
	const handleVote = async () => {
		if (!onVote || !userId || selectedOptions.length === 0) return;
		setIsVoting(true);
		await onVote(poll.id, selectedOptions).then(() => {
			notifySuccess({
				title: "Vote recorded",
				message: "Your response has been saved."
			});
			setShowResults(true);
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "PollCard:handleVote",
				title: "Failed to record vote",
				fallbackMessage: "Failed to record vote"
			});
		}).finally(() => {
			setIsVoting(false);
		});
	};
	const handleShowResults = () => {
		setShowResults(true);
	};
	const handleToggleOption = (optionId) => {
		if (poll.multipleChoice) setSelectedOptions((prev) => prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]);
		else setSelectedOptions([optionId]);
	};
	const handleEndPoll = async () => {
		if (!onEndPoll) return;
		try {
			await onEndPoll(poll.id);
			notifySuccess({
				title: "Poll ended",
				message: "The poll has been closed and results are final."
			});
		} catch (error) {
			reportConvexFailure({
				error,
				context: "PollCard:handleEndPoll",
				title: "Failed to end poll",
				fallbackMessage: "Failed to end poll"
			});
		}
	};
	const isExpired = typeof poll.endTime === "string" ? new Date(poll.endTime) < /* @__PURE__ */ new Date() : false;
	const footerUi = {
		canEnd: canEnd && !!onEndPoll,
		canVote,
		hasVoted,
		isExpired: typeof poll.endTime === "string" ? new Date(poll.endTime) < /* @__PURE__ */ new Date() : false,
		isVoting,
		showResults
	};
	const optionRowFlags = {
		canVote,
		hasVoted,
		isExpired,
		showResults
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("border rounded-lg overflow-hidden bg-muted/30", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PollCardHeader, {
				isExpired,
				poll,
				totalVotes
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-3 space-y-2",
				children: sortedOptions.map((option, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PollOptionRowItem, {
					flags: optionRowFlags,
					handleToggleOption,
					index,
					option,
					selectedOptions,
					sortedOptions,
					totalVotes
				}, option.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PollCardFooterActions, {
				ui: footerUi,
				onEndPoll: handleEndPoll,
				onShowResults: handleShowResults,
				onVote: handleVote,
				selectedOptionsCount: selectedOptions.length
			})
		]
	});
}
function createInitialPollFormState() {
	return {
		question: "",
		options: [{
			id: "1",
			text: ""
		}, {
			id: "2",
			text: ""
		}],
		multipleChoice: false,
		anonymous: false
	};
}
function createPollFormReducer(state, action) {
	switch (action.type) {
		case "reset": return createInitialPollFormState();
		case "setQuestion": return {
			...state,
			question: action.value
		};
		case "addOption": return {
			...state,
			options: [...state.options, {
				id: String(state.options.length + 1),
				text: ""
			}]
		};
		case "removeOption":
			if (state.options.length <= 2) return state;
			return {
				...state,
				options: state.options.filter((opt) => opt.id !== action.id)
			};
		case "setOptionText": return {
			...state,
			options: state.options.map((opt) => opt.id === action.id ? {
				...opt,
				text: action.text
			} : opt)
		};
		case "setMultipleChoice": return {
			...state,
			multipleChoice: action.value
		};
		case "setAnonymous": return {
			...state,
			anonymous: action.value
		};
		default: return state;
	}
}
/**
* Dialog for creating a new poll
*/
function CreatePollDialog({ workspaceId, userId, onCreate, trigger }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [isCreating, setIsCreating] = (0, import_react.useState)(false);
	const [formState, dispatch] = (0, import_react.useReducer)(createPollFormReducer, void 0, createInitialPollFormState);
	const { question, options, multipleChoice, anonymous } = formState;
	const handleAddOption = () => {
		dispatch({ type: "addOption" });
	};
	const handleRemoveOption = (id) => {
		dispatch({
			type: "removeOption",
			id
		});
	};
	const handleOptionChange = (id, text) => {
		dispatch({
			type: "setOptionText",
			id,
			text
		});
	};
	const handleQuestionChange = (value) => {
		dispatch({
			type: "setQuestion",
			value
		});
	};
	const handleMultipleChoiceChange = (value) => {
		dispatch({
			type: "setMultipleChoice",
			value
		});
	};
	const handleAnonymousChange = (value) => {
		dispatch({
			type: "setAnonymous",
			value
		});
	};
	const resetForm = () => {
		dispatch({ type: "reset" });
	};
	const handleCreate = async () => {
		if (!workspaceId || !userId) {
			notifyFailure({
				title: "Authentication required",
				message: "Authentication required"
			});
			return;
		}
		const trimmedQuestion = question.trim();
		if (!trimmedQuestion) {
			notifyFailure({
				title: "Question required",
				message: "Please enter a question for the poll."
			});
			return;
		}
		const validOptions = options.flatMap((opt) => {
			const text = opt.text.trim();
			return text.length > 0 ? [{
				...opt,
				text,
				id: crypto.randomUUID()
			}] : [];
		});
		if (validOptions.length < 2) {
			notifyFailure({
				title: "At least 2 options required",
				message: "Please provide at least 2 answer options."
			});
			return;
		}
		setIsCreating(true);
		const newPoll = {
			question: trimmedQuestion,
			options: validOptions.map((opt) => ({
				...opt,
				voters: []
			})),
			multipleChoice,
			anonymous,
			createdBy: userId,
			createdByName: "You",
			endTime: null
		};
		await Promise.resolve(onCreate?.(newPoll)).then(() => {
			notifySuccess({
				title: "Poll created",
				message: "Your poll has been posted to the channel."
			});
			resetForm();
			setOpen(false);
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "CreatePollDialog:handleCreate",
				title: "Failed to create poll",
				fallbackMessage: "Failed to create poll"
			});
		}).finally(() => {
			setIsCreating(false);
		});
	};
	const handleCancelCreate = () => {
		setOpen(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [trigger ?? CREATE_POLL_DEFAULT_TRIGGER, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatePollDialogHeader, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatePollFormFields, {
					onAddOption: handleAddOption,
					onOptionChange: handleOptionChange,
					onQuestionChange: handleQuestionChange,
					onRemoveOption: handleRemoveOption,
					options,
					question
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatePollSettings, {
					anonymous,
					multipleChoice,
					onAnonymousChange: handleAnonymousChange,
					onMultipleChoiceChange: handleMultipleChoiceChange
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatePollDialogFooter, {
					isCreating,
					onCancel: handleCancelCreate,
					onCreate: handleCreate,
					question
				})
			]
		})]
	});
}
/**
* Quick poll button for message composer toolbar
*/
function QuickPollButton(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreatePollDialog, {
		...props,
		trigger: (0, import_react.createElement)(QuickPollTrigger)
	});
}
function formatTime(ms) {
	return new Date(ms).toLocaleTimeString(void 0, {
		hour: "2-digit",
		minute: "2-digit"
	});
}
function MessageContentBody({ message, Content }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: CHAT_MESSAGE_BODY_CLASS,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, { message })
	});
}
function getInitials$1(name) {
	return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}
function MessageListLoadingState({ loadingSkeleton }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex-1 min-h-0 overflow-y-auto p-4",
		children: loadingSkeleton || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-4",
			children: [
				"loading-row-1",
				"loading-row-2",
				"loading-row-3"
			].map((slot, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex gap-2", index % 2 === 1 && "justify-end"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-10 shrink-0 animate-pulse rounded-full bg-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-32 animate-pulse rounded bg-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-16 w-48 animate-pulse rounded-lg bg-muted" })]
				})]
			}, slot))
		})
	});
}
function MessageListEmptyState({ emptyState }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex-1 min-h-0 overflow-y-auto p-4",
		children: emptyState || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-full items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "No messages yet"
			})
		})
	});
}
function MessageListLoadMoreButton({ disabled, isLoading, onLoadMore }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex justify-center pb-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "sm",
			onClick: onLoadMore,
			disabled,
			children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-3.5 animate-spin" }), "Loading…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-2 size-3.5" }), "Load older messages"] })
		})
	});
}
function MessageDateSeparator({ date }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, {
		y: 6,
		duration: .18,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "flex-1" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-medium text-muted-foreground",
					children: date
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "flex-1" })
			]
		})
	});
}
function MessageReactionRow({ currentUserId, disabled, localReactionPending, message, onReact, reactionPendingByMessage }) {
	const handleReactionClick = (event) => {
		const messageId = event.currentTarget.dataset.messageId;
		const emoji = event.currentTarget.dataset.emoji;
		if (!messageId || !emoji) return;
		onReact(messageId, emoji);
	};
	if (!message.reactions || message.reactions.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-1 flex flex-wrap gap-1",
		children: message.reactions.map((reaction) => {
			const isPending = localReactionPending === `${message.id}-${reaction.emoji}` || reactionPendingByMessage[message.id] === reaction.emoji;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: handleReactionClick,
				"data-message-id": message.id,
				"data-emoji": reaction.emoji,
				disabled,
				className: cn("inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs", chromaticTransitionClass, reaction.userIds.includes(currentUserId ?? "") ? "border border-accent/20 bg-accent/10" : "bg-muted hover:bg-muted/80"),
				children: [isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: reaction.emoji }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: reaction.count
				})]
			}, reaction.emoji);
		})
	});
}
function MessageReactionPickerActions({ actions, align = "start", disabled, message, onReact }) {
	const handleEmojiClick = (emojiData) => {
		onReact(message.id, emojiData.emoji);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 shrink-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				className: "size-6",
				disabled,
				"aria-label": "Add reaction",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smile, { className: "size-3" })
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
			className: "w-auto p-0",
			align,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(emoji_picker_default, {
				onEmojiClick: handleEmojiClick,
				theme: Theme.LIGHT,
				width: 300,
				height: 350
			})
		})] }), actions]
	});
}
function ChannelMessageCardWithPending({ isDeleting, isEditing, isUpdating, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelMessageCard, {
		pending: {
			deleting: isDeleting,
			editing: isEditing,
			updating: isUpdating
		},
		...props
	});
}
function ChannelMessageCard({ currentUserId, highlighted, pending, localReactionPending, message, onReact, reactionPendingByMessage, renderers, showAvatars }) {
	const { deleting: isDeleting, editing: isEditing, updating: isUpdating } = pending;
	const isPendingThis = localReactionPending?.startsWith(message.id) || reactionPendingByMessage[message.id];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-message-id": message.id,
		"data-thread-root-id": message.threadRootId ?? message.id,
		className: cn("group relative flex max-w-full items-start gap-3 overflow-hidden px-6 py-2.5", listRowEnterAnimationClass, chromaticTransitionClass, !message.deleted && "hover:bg-muted/5", highlighted && "rounded-lg bg-accent/10 ring-1 ring-primary/30"),
		children: [
			showAvatars ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "shrink-0 pt-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
					className: "size-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
						className: "bg-muted text-xs",
						children: getInitials$1(message.senderName)
					})
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1 space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium",
								children: message.senderName
							}),
							message.senderRole ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground",
								children: [
									"(",
									message.senderRole,
									")"
								]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: formatTime(message.createdAtMs)
							}),
							message.edited && !message.deleted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "(edited)"
							}) : null
						]
					}),
					isEditing && renderers.renderEditForm ? renderers.renderEditForm(message) : message.deleted ? renderers.renderDeletedInfo ? renderers.renderDeletedInfo(message) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm italic text-muted-foreground",
						children: "Message removed"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [renderers.renderMessageContent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageContentBody, {
						message,
						Content: renderers.renderMessageContent
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn(CHAT_MESSAGE_BODY_CLASS, "whitespace-pre-wrap text-sm"),
						children: message.content
					}), renderers.renderMessageAttachments?.(message)] }),
					!isEditing && !message.deleted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageReactionRow, {
						currentUserId,
						disabled: Boolean(isPendingThis) || isDeleting || isUpdating,
						localReactionPending,
						message,
						onReact,
						reactionPendingByMessage
					}) : null,
					renderers.renderMessageExtras?.(message),
					!isEditing && !message.deleted ? renderers.renderThreadSection?.(message) : null,
					renderers.renderMessageFooter?.(message)
				]
			}),
			!isEditing && !message.deleted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageReactionPickerActions, {
				actions: renderers.renderMessageActions?.(message),
				disabled: isDeleting || isUpdating,
				message,
				onReact
			}) : null,
			isDeleting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-center justify-center rounded-lg bg-background/80",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-muted-foreground" })
			}) : null
		]
	});
}
function DirectMessageCard({ currentUserId, isDeleting, isEditing, localReactionPending, message, onReact, reactionPendingByMessage, renderers, showAvatars }) {
	const isOwn = message.senderId === currentUserId;
	const isPendingThis = localReactionPending?.startsWith(message.id) || reactionPendingByMessage[message.id];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-message-id": message.id,
		"data-thread-root-id": message.threadRootId ?? message.id,
		className: cn("group relative flex max-w-full gap-2 overflow-hidden", listRowEnterAnimationClass, isOwn && "justify-end"),
		children: [
			showAvatars && !isOwn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
				className: "size-8 shrink-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
					className: "bg-muted text-xs",
					children: getInitials$1(message.senderName)
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex min-w-0 max-w-[min(70%,100%)] flex-col", isOwn && "items-end"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("max-w-full min-w-0 overflow-hidden rounded-lg px-3 py-2", chromaticTransitionClass, message.deleted ? "border border-dashed border-muted/60 bg-background/70 text-muted-foreground" : isOwn ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted shadow-sm"),
						children: isEditing && renderers.renderEditForm ? renderers.renderEditForm(message) : message.deleted ? renderers.renderDeletedInfo ? renderers.renderDeletedInfo(message) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm italic text-muted-foreground",
							children: "Message removed"
						}) : renderers.renderMessageContent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageContentBody, {
							message,
							Content: renderers.renderMessageContent
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn(CHAT_MESSAGE_BODY_CLASS, "whitespace-pre-wrap text-sm"),
							children: message.content
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("mt-1 flex items-center gap-1", isOwn && "justify-end"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-muted-foreground",
							children: formatTime(message.createdAtMs)
						}), message.edited && !message.deleted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-muted-foreground",
							children: "(edited)"
						}) : null]
					}),
					!isEditing && !message.deleted ? renderers.renderMessageAttachments?.(message) : null,
					!isEditing && !message.deleted && message.reactions && message.reactions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("mt-1 flex flex-wrap gap-1", isOwn && "justify-end"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageReactionRow, {
							currentUserId,
							disabled: Boolean(isPendingThis),
							localReactionPending,
							message,
							onReact,
							reactionPendingByMessage
						})
					}) : null,
					renderers.renderMessageExtras?.(message),
					renderers.renderMessageFooter?.(message),
					!isEditing && !message.deleted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("mt-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100", isOwn && "justify-end"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageReactionPickerActions, {
							actions: renderers.renderMessageActions?.(message),
							align: "start",
							message,
							onReact
						})
					}) : null
				]
			}),
			showAvatars && isOwn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
				className: "size-8 shrink-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
					className: "bg-primary text-xs text-primary-foreground",
					children: getInitials$1(message.senderName)
				})
			}) : null,
			isDeleting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-center justify-center rounded-lg bg-background/80",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-muted-foreground" })
			}) : null
		]
	});
}
function MessageListMessageEntry({ message, isChannel, currentUserId, highlightedMessageId, editingMessageId, deletingMessageId, updatingMessageId, localReactionPending, reactionPendingByMessage, renderers, showAvatars, onReact, renderMessageWrapper }) {
	const isEditing = editingMessageId === message.id;
	const isDeleting = deletingMessageId === message.id;
	const isUpdating = updatingMessageId === message.id;
	const content = isChannel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelMessageCardWithPending, {
		currentUserId,
		highlighted: message.id === highlightedMessageId,
		isDeleting,
		isEditing,
		isUpdating,
		localReactionPending,
		message,
		onReact,
		reactionPendingByMessage,
		renderers,
		showAvatars
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DirectMessageCard, {
		currentUserId,
		isDeleting,
		isEditing,
		localReactionPending,
		message,
		onReact,
		reactionPendingByMessage,
		renderers,
		showAvatars
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: renderMessageWrapper ? renderMessageWrapper(message, content) : content }, message.id);
}
function MessageListDayGroup({ date, messages, isChannel, currentUserId, highlightedMessageId, editingMessageId, deletingMessageId, updatingMessageId, localReactionPending, reactionPendingByMessage, renderers, showAvatars, onReact, renderMessageWrapper }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageDateSeparator, { date }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("space-y-3", isChannel && "space-y-1"),
		children: messages.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageListMessageEntry, {
			message,
			isChannel,
			currentUserId,
			highlightedMessageId,
			editingMessageId,
			deletingMessageId,
			updatingMessageId,
			localReactionPending,
			reactionPendingByMessage,
			renderers,
			showAvatars,
			onReact,
			renderMessageWrapper
		}, message.id))
	})] }, date);
}
function MessageListGroupedMessages({ groupedMessages, isChannel, currentUserId, highlightedMessageId, editingMessageId, deletingMessageId, updatingMessageId, localReactionPending, reactionPendingByMessage, renderers, showAvatars, onReact }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("space-y-6", isChannel && "space-y-1"),
		children: Array.from(groupedMessages.entries()).map(([date, msgs]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageListDayGroup, {
			date,
			messages: msgs,
			isChannel,
			currentUserId,
			highlightedMessageId,
			editingMessageId,
			deletingMessageId,
			updatingMessageId,
			localReactionPending,
			reactionPendingByMessage,
			renderers,
			showAvatars,
			onReact,
			renderMessageWrapper: renderers.renderMessageWrapper
		}, date))
	});
}
function MessageListJumpToLatest({ visible, onClick }) {
	if (!visible) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute bottom-4 right-4 z-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			size: "sm",
			variant: "outline",
			className: "pointer-events-auto gap-1.5 text-foreground shadow-md ring-1 ring-border/60 hover:bg-muted/80",
			onClick,
			"aria-label": "Jump to latest messages",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, {
				className: "size-3.5",
				"aria-hidden": true
			}), "Latest"]
		})
	});
}
function MessageListScrollBody({ scrollRef, messagesEndRef, isChannel, hasMore, isLoading, groupedMessages, typingIndicatorText, onScroll, onLoadMore, groupedMessagesProps }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: scrollRef,
		onScroll,
		className: "min-h-0 flex-1 overflow-x-hidden overflow-y-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("min-w-0 max-w-full p-4", isChannel && "space-y-4"),
			children: [
				hasMore && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageListLoadMoreButton, {
					disabled: isLoading,
					isLoading,
					onLoadMore
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageListGroupedMessages, {
					groupedMessages,
					isChannel,
					...groupedMessagesProps
				}),
				typingIndicatorText ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatTypingIndicator, {
					label: typingIndicatorText,
					variant: "bubble",
					className: "mt-2"
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: messagesEndRef })
			]
		})
	});
}
var MessageListRenderContext = (0, import_react.createContext)(null);
function MessageListRenderProvider({ children, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageListRenderContext.Provider, {
		value,
		children
	});
}
function useMessageListRenderContext() {
	return (0, import_react.use)(MessageListRenderContext);
}
function formatDate(ms) {
	return new Date(ms).toLocaleDateString(void 0, {
		weekday: "long",
		month: "short",
		day: "numeric"
	});
}
function groupMessagesByDate(messages) {
	const groups = /* @__PURE__ */ new Map();
	const seenIds = /* @__PURE__ */ new Set();
	for (const message of messages) {
		if (seenIds.has(message.id)) continue;
		seenIds.add(message.id);
		const dateKey = formatDate(message.createdAtMs);
		const existing = groups.get(dateKey) ?? [];
		existing.push(message);
		groups.set(dateKey, existing);
	}
	return groups;
}
var EMPTY_REACTION_PENDING_BY_MESSAGE$1 = {};
function useMessageListController({ messages, hasMore, isLoading, onLoadMore, onToggleReaction, reactionPendingByMessage = EMPTY_REACTION_PENDING_BY_MESSAGE$1, renderers: renderersProp, focusMessageId, focusThreadId, typingIndicatorText }) {
	const renderContext = useMessageListRenderContext();
	const scrollRef = (0, import_react.useRef)(null);
	const messagesEndRef = (0, import_react.useRef)(null);
	const prependSnapshotRef = (0, import_react.useRef)(null);
	const loadingOlderRef = (0, import_react.useRef)(false);
	const lastFocusedMessageRef = (0, import_react.useRef)(null);
	const previousEdgeRef = (0, import_react.useRef)({
		firstId: null,
		lastId: null
	});
	const shouldStickToBottomRef = (0, import_react.useRef)(true);
	const hasAutoScrolledInitiallyRef = (0, import_react.useRef)(false);
	const [localReactionPending, setLocalReactionPending] = (0, import_react.useState)(null);
	const [highlightedMessageId, setHighlightedMessageId] = (0, import_react.useState)(null);
	const [showJumpToLatest, setShowJumpToLatest] = (0, import_react.useState)(false);
	const sortedMessages = messages.toSorted((a, b) => a.createdAtMs - b.createdAtMs);
	const groupedMessages = groupMessagesByDate(sortedMessages);
	const renderers = (() => {
		if (!renderContext && !renderersProp) return;
		return {
			...renderContext ?? {},
			...renderersProp
		};
	})();
	const requestLoadOlder = () => {
		const container = scrollRef.current;
		if (!container || !hasMore || isLoading || loadingOlderRef.current) return;
		prependSnapshotRef.current = {
			scrollTop: container.scrollTop,
			scrollHeight: container.scrollHeight
		};
		loadingOlderRef.current = true;
		onLoadMore();
	};
	(0, import_react.useEffect)(() => {
		if (!isLoading && loadingOlderRef.current && prependSnapshotRef.current) {
			loadingOlderRef.current = false;
			prependSnapshotRef.current = null;
		}
	}, [isLoading]);
	(0, import_react.useEffect)(() => {
		const container = scrollRef.current;
		if (!container) return;
		const firstId = sortedMessages[0]?.id ?? null;
		const lastMessage = sortedMessages.length > 0 ? sortedMessages[sortedMessages.length - 1] : null;
		const lastId = lastMessage ? lastMessage.id : null;
		const previousFirst = previousEdgeRef.current.firstId;
		const previousLast = previousEdgeRef.current.lastId;
		if (prependSnapshotRef.current) {
			const snapshot = prependSnapshotRef.current;
			const delta = container.scrollHeight - snapshot.scrollHeight;
			container.scrollTop = snapshot.scrollTop + delta;
			prependSnapshotRef.current = null;
			loadingOlderRef.current = false;
		} else if (!hasAutoScrolledInitiallyRef.current && sortedMessages.length > 0) {
			container.scrollTop = container.scrollHeight;
			shouldStickToBottomRef.current = true;
			hasAutoScrolledInitiallyRef.current = true;
		} else if ((previousFirst !== null && previousLast !== null && firstId !== null && lastId !== null && previousFirst !== firstId && previousLast !== lastId || previousLast !== null && previousFirst === firstId && previousLast !== lastId) && shouldStickToBottomRef.current) container.scrollTop = container.scrollHeight;
		previousEdgeRef.current = {
			firstId,
			lastId
		};
	}, [sortedMessages]);
	(0, import_react.useEffect)(() => {
		if (!typingIndicatorText) return;
		const container = scrollRef.current;
		if (!container || !shouldStickToBottomRef.current) return;
		const frame = requestAnimationFrame(() => {
			container.scrollTo({
				top: container.scrollHeight,
				behavior: "smooth"
			});
		});
		return () => {
			cancelAnimationFrame(frame);
		};
	}, [typingIndicatorText]);
	(0, import_react.useEffect)(() => {
		lastFocusedMessageRef.current = null;
	}, [focusMessageId, focusThreadId]);
	(0, import_react.useEffect)(() => {
		const resolvedFocusId = (typeof focusMessageId === "string" && focusMessageId.trim().length > 0 ? focusMessageId.trim() : null) ?? (typeof focusThreadId === "string" && focusThreadId.trim().length > 0 ? sortedMessages.find((message) => {
			return (typeof message.threadRootId === "string" && message.threadRootId.trim().length > 0 ? message.threadRootId.trim() : message.id) === focusThreadId.trim();
		})?.id ?? null : null);
		if (!resolvedFocusId) return;
		if (!sortedMessages.some((message) => message.id === resolvedFocusId) && hasMore && !isLoading) onLoadMore();
	}, [
		focusMessageId,
		focusThreadId,
		hasMore,
		isLoading,
		onLoadMore,
		sortedMessages
	]);
	(0, import_react.useEffect)(() => {
		const container = scrollRef.current;
		if (!container) return;
		const resolvedFocusId = (typeof focusMessageId === "string" && focusMessageId.trim().length > 0 ? focusMessageId.trim() : null) ?? (typeof focusThreadId === "string" && focusThreadId.trim().length > 0 ? sortedMessages.find((message) => {
			return (typeof message.threadRootId === "string" && message.threadRootId.trim().length > 0 ? message.threadRootId.trim() : message.id) === focusThreadId.trim();
		})?.id ?? null : null);
		if (!resolvedFocusId) return;
		if (lastFocusedMessageRef.current === resolvedFocusId) return;
		const candidates = container.querySelectorAll("[data-message-id]");
		let target = null;
		for (const node of candidates) if (node.dataset.messageId === resolvedFocusId) {
			target = node;
			break;
		}
		if (!target) return;
		lastFocusedMessageRef.current = resolvedFocusId;
		target.scrollIntoView({
			behavior: "smooth",
			block: "center"
		});
		const frame = window.requestAnimationFrame(() => {
			setHighlightedMessageId(resolvedFocusId);
		});
		const timer = window.setTimeout(() => {
			setHighlightedMessageId((current) => current === resolvedFocusId ? null : current);
		}, 2400);
		return () => {
			window.cancelAnimationFrame(frame);
			window.clearTimeout(timer);
		};
	}, [
		focusMessageId,
		focusThreadId,
		sortedMessages
	]);
	const scrollToLatest = () => {
		const container = scrollRef.current;
		if (!container) return;
		container.scrollTo({
			top: container.scrollHeight,
			behavior: "smooth"
		});
		shouldStickToBottomRef.current = true;
		setShowJumpToLatest(false);
	};
	const handleScroll = () => {
		const container = scrollRef.current;
		if (!container) return;
		const distanceFromBottom = container.scrollHeight - (container.scrollTop + container.clientHeight);
		shouldStickToBottomRef.current = distanceFromBottom < 80;
		setShowJumpToLatest(distanceFromBottom > 200 && sortedMessages.length > 0);
		if (container.scrollTop < 64) requestLoadOlder();
	};
	const handleReaction = async (messageId, emoji) => {
		const key = `${messageId}-${emoji}`;
		if (localReactionPending) return;
		setLocalReactionPending(key);
		try {
			await onToggleReaction(messageId, emoji);
		} finally {
			setLocalReactionPending(null);
		}
	};
	return {
		scrollRef,
		messagesEndRef,
		groupedMessages,
		renderers,
		localReactionPending,
		highlightedMessageId,
		showJumpToLatest,
		reactionPendingByMessage,
		requestLoadOlder,
		scrollToLatest,
		handleScroll,
		handleReaction,
		sortedMessages
	};
}
function MessageListActiveBody({ variant = "dm", currentUserId, showAvatars = true, editingMessageId, deletingMessageId, updatingMessageId, ...controllerArgs }) {
	const { scrollRef, messagesEndRef, groupedMessages, renderers, localReactionPending, highlightedMessageId, showJumpToLatest, reactionPendingByMessage: effectiveReactionPending, requestLoadOlder, scrollToLatest, handleScroll, handleReaction } = useMessageListController(controllerArgs);
	const isChannel = variant === "channel";
	const groupedMessagesProps = {
		currentUserId,
		highlightedMessageId,
		editingMessageId,
		deletingMessageId,
		updatingMessageId,
		localReactionPending,
		reactionPendingByMessage: effectiveReactionPending,
		renderers: renderers ?? {},
		showAvatars,
		onReact: handleReaction
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-0 flex-1 flex-col overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageListScrollBody, {
			scrollRef,
			messagesEndRef,
			isChannel,
			hasMore: controllerArgs.hasMore,
			isLoading: controllerArgs.isLoading,
			groupedMessages,
			typingIndicatorText: controllerArgs.typingIndicatorText,
			onScroll: handleScroll,
			onLoadMore: requestLoadOlder,
			groupedMessagesProps
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageListJumpToLatest, {
			visible: showJumpToLatest,
			onClick: scrollToLatest
		})]
	});
}
function mergeMessageListRenderers({ renderers: renderersProp, renderMessageExtras, renderMessageActions, renderMessageContent, renderMessageAttachments, renderMessageFooter, renderThreadSection, renderEditForm, renderDeletedInfo, renderMessageWrapper }) {
	const merged = {
		...renderersProp,
		renderMessageExtras: renderMessageExtras ?? renderersProp?.renderMessageExtras,
		renderMessageActions: renderMessageActions ?? renderersProp?.renderMessageActions,
		renderMessageAttachments: renderMessageAttachments ?? renderersProp?.renderMessageAttachments,
		renderMessageFooter: renderMessageFooter ?? renderersProp?.renderMessageFooter,
		renderThreadSection: renderThreadSection ?? renderersProp?.renderThreadSection,
		renderEditForm: renderEditForm ?? renderersProp?.renderEditForm,
		renderDeletedInfo: renderDeletedInfo ?? renderersProp?.renderDeletedInfo,
		renderMessageWrapper: renderMessageWrapper ?? renderersProp?.renderMessageWrapper
	};
	const content = renderMessageContent ?? renderersProp?.renderMessageContent;
	if (content) merged.renderMessageContent = isNormalizedMessageContentComponent(content) ? content : toMessageContentComponent(content);
	return Object.values(merged).some((value) => value !== void 0) ? merged : void 0;
}
function useMessageListRenderers({ renderers: renderersProp, renderMessageExtras, renderMessageActions, renderMessageContent, renderMessageAttachments, renderMessageFooter, renderThreadSection, renderEditForm, renderDeletedInfo, renderMessageWrapper }) {
	return mergeMessageListRenderers({
		renderers: renderersProp,
		renderMessageExtras,
		renderMessageActions,
		renderMessageContent,
		renderMessageAttachments,
		renderMessageFooter,
		renderThreadSection,
		renderEditForm,
		renderDeletedInfo,
		renderMessageWrapper
	});
}
var MESSAGE_CONTENT_COMPONENT_NAME = "MessageContentComponent";
function isNormalizedMessageContentComponent(renderer) {
	return typeof renderer === "function" && renderer.name === MESSAGE_CONTENT_COMPONENT_NAME;
}
function toMessageContentComponent(renderer) {
	if (isNormalizedMessageContentComponent(renderer)) return renderer;
	const usesDirectMessageArg = typeof renderer === "function" && renderer.length === 1 && renderer.name === "";
	return function MessageContentComponent({ message }) {
		if (usesDirectMessageArg) return renderer(message);
		return (0, import_react.createElement)(renderer, { message });
	};
}
function MessageList({ messages, currentUserId, isLoading, hasMore, onLoadMore, onToggleReaction, reactionPendingByMessage, renderers: renderersProp, renderMessageExtras, renderMessageActions, renderMessageContent, renderMessageAttachments, renderMessageFooter, renderThreadSection, renderEditForm, renderDeletedInfo, renderMessageWrapper, emptyState, loadingSkeleton, variant = "dm", showAvatars = true, editingMessageId, deletingMessageId, updatingMessageId, focusMessageId, focusThreadId, typingIndicatorText }) {
	const renderers = useMessageListRenderers({
		renderers: renderersProp,
		renderMessageExtras,
		renderMessageActions,
		renderMessageContent,
		renderMessageAttachments,
		renderMessageFooter,
		renderThreadSection,
		renderEditForm,
		renderDeletedInfo,
		renderMessageWrapper
	});
	if (isLoading && messages.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageListLoadingState, { loadingSkeleton })
	});
	if (messages.length === 0 && !isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageListEmptyState, { emptyState })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageListActiveBody, {
		messages,
		hasMore,
		isLoading,
		onLoadMore,
		onToggleReaction,
		reactionPendingByMessage,
		renderers,
		focusMessageId,
		focusThreadId,
		typingIndicatorText,
		variant,
		currentUserId,
		showAvatars,
		editingMessageId,
		deletingMessageId,
		updatingMessageId
	});
}
var POLL_FENCE = "```cohort-poll";
function encodePollMessage(poll) {
	const payload = {
		...poll,
		id: poll.id ?? crypto.randomUUID(),
		createdAt: poll.createdAt ?? (/* @__PURE__ */ new Date()).toISOString()
	};
	return `${POLL_FENCE}\n${JSON.stringify(payload)}\n\`\`\``;
}
function parsePollMessage(content) {
	if (!content || !content.includes(POLL_FENCE)) return null;
	const match = content.match(/```cohort-poll\s*([\s\S]*?)```/i);
	if (!match?.[1]) return null;
	try {
		const parsed = JSON.parse(match[1].trim());
		if (!parsed?.question || !Array.isArray(parsed.options) || parsed.options.length < 2) return null;
		return parsed;
	} catch {
		return null;
	}
}
function ImageUrlPreview({ url, className }) {
	const [isLoading, setIsLoading] = (0, import_react.useState)(true);
	const [hasError, setHasError] = (0, import_react.useState)(false);
	const [previewOpen, setPreviewOpen] = (0, import_react.useState)(false);
	const handleOpenPreview = () => {
		setPreviewOpen(true);
	};
	const handleKeyDown = (event) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			setPreviewOpen(true);
		}
	};
	const handleImageLoad = () => {
		setIsLoading(false);
	};
	const handleImageError = () => {
		setIsLoading(false);
		setHasError(true);
	};
	const handleClosePreview = () => {
		setPreviewOpen(false);
	};
	const fileName = (() => {
		const segments = ((url.split("?")[0] ?? "").split("#")[0] ?? "").split("/").filter(Boolean);
		const lastSegment = segments[segments.length - 1];
		if (typeof lastSegment === "string" && lastSegment.length > 0) return lastSegment;
		return "Image";
	})();
	if (hasError) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href: url,
		target: "_blank",
		rel: "noopener noreferrer",
		className: "inline-flex items-center gap-1.5 text-sm text-primary underline-offset-2 hover:underline",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-3.5 text-muted-foreground" }), fileName]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: cn("group relative block max-w-md overflow-hidden rounded-lg border border-muted/60 bg-muted/10 cursor-pointer motion-chromatic hover:border-muted my-2", className),
		onClick: handleOpenPreview,
		onKeyDown: handleKeyDown,
		"aria-label": `Preview image ${fileName}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative overflow-hidden",
			children: [
				isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 flex items-center justify-center bg-muted/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin text-muted-foreground" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyImage, {
					src: url,
					alt: fileName,
					className: cn("max-h-80 w-auto object-contain motion-chromatic-lg", isLoading && "opacity-0", "group-hover:scale-105"),
					onLoad: handleImageLoad,
					onError: handleImageError
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-viewer-chrome opacity-0 transition-opacity group-hover:opacity-100",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-medium",
							children: "Preview"
						})]
					})
				})
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePreviewModal, {
		images: [{
			url,
			name: fileName
		}],
		isOpen: previewOpen,
		onClose: handleClosePreview
	})] });
}
var fetchLinkPreview = async (requestUrl) => {
	const response = await fetch("/api/utils/link-preview", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ url: requestUrl })
	});
	if (!response.ok) throw new Error("Failed to fetch link preview");
	return response.json();
};
function LinkPreviewCard({ url }) {
	const { data, error, isLoading } = useQuery$1({
		queryKey: ["link-preview", url],
		queryFn: () => fetchLinkPreview(url),
		refetchOnWindowFocus: false,
		retry: false,
		staleTime: 300 * 1e3
	});
	const parsedUrl = (() => {
		try {
			return new URL(url);
		} catch {
			return null;
		}
	})();
	const preview = data ?? { url };
	const title = preview.title?.trim() || preview.siteName?.trim() || parsedUrl?.hostname || url;
	const description = preview.description?.trim() || "";
	const imageUrl = preview.image?.trim();
	const domain = parsedUrl?.hostname || "";
	const handleImageError = (event) => {
		event.currentTarget.style.display = "none";
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "max-w-xl border-muted/60 bg-muted/10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex gap-3 p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("relative hidden h-24 w-32 flex-shrink-0 overflow-hidden rounded-md border border-muted/40 bg-background sm:block", imageUrl ? void 0 : "flex items-center justify-center p-3"),
					"aria-hidden": !imageUrl,
					children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex size-full items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin text-muted-foreground" })
					}) : imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyImage, {
						src: imageUrl,
						alt: title,
						className: "size-full object-cover",
						onError: handleImageError
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex size-full items-center justify-center text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "size-5" })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: url,
						target: "_blank",
						rel: "noreferrer noopener",
						className: "line-clamp-2 text-sm font-semibold text-foreground hover:underline",
						children: title
					}), domain ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: domain
					}) : null] }), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Fetching preview…"
					}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Preview unavailable"
					}) : description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "line-clamp-2 text-xs text-muted-foreground",
						children: description
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-24 flex-shrink-0 items-start",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: url,
						target: "_blank",
						rel: "noreferrer noopener",
						className: "inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:text-primary",
						"aria-label": "Open link",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })
					})
				})
			]
		})
	});
}
/**
* Delivery status indicator for sender's own messages
* Shows when the message was sent, delivered, and read
*/
function MessageDeliveryStatus({ message, currentUserId, memberNames, className }) {
	if (message.senderId !== currentUserId || message.isDeleted) return null;
	const readBy = message.readBy ?? [];
	const deliveredTo = message.deliveredTo ?? [];
	const readCount = readBy.length;
	const deliveredCount = deliveredTo.length;
	let status = "sent";
	let tooltipText = "Sent";
	if (readCount > 0) {
		status = "read";
		if (readCount === 1) tooltipText = `Read by ${readBy[0] ? memberNames?.[readBy[0]] : "someone"}`;
		else if (readCount === 2) tooltipText = `Read by ${readBy[0] ? memberNames?.[readBy[0]] : "someone"} and ${readBy[1] ? memberNames?.[readBy[1]] : "someone else"}`;
		else tooltipText = `Read by ${readCount} people`;
	} else if (deliveredCount > 0) {
		status = "delivered";
		tooltipText = `Delivered to ${deliveredCount} ${deliveredCount === 1 ? "person" : "people"}`;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
		delayDuration: 300,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: cn("flex items-center gap-0.5 text-muted-foreground", className),
				children: [
					status === "sent" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 text-muted-foreground" }),
					status === "delivered" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "size-3.5 text-muted-foreground" }),
					status === "read" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "size-3.5 text-primary fill-primary" }),
					(readCount > 0 || deliveredCount > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: readCount > 0 ? readCount : deliveredCount
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
			side: "bottom",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: tooltipText })
		})] })
	});
}
function MessageEditForm({ value, onChange, onConfirm, onCancel, isUpdating, editingPreview }) {
	const onEditContentChange = (event) => onChange(event.target.value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				value,
				onChange: onEditContentChange,
				disabled: isUpdating,
				maxLength: 2e3,
				className: "min-h-[88px]"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Editing message" }), editingPreview && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "truncate",
					children: [
						"\"",
						editingPreview,
						"\""
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					size: "sm",
					onClick: onConfirm,
					disabled: isUpdating || value.trim().length === 0,
					children: [isUpdating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : null, "Save changes"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					variant: "ghost",
					onClick: onCancel,
					disabled: isUpdating,
					children: "Cancel"
				})]
			})
		]
	});
}
function DeletedMessageInfo({ deletedBy, deletedAt }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-2 text-xs text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Deleted by ", deletedBy ?? "teammate"] }), deletedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["· ", formatRelativeTime(deletedAt)] })]
	});
}
function DeletingOverlay({ isDeleting }) {
	if (!isDeleting) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 flex items-center justify-center rounded-md bg-background/80 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-xs text-destructive",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Removing message…" })]
		})
	});
}
function MessagePollCardBlock({ message, poll, currentUserId, isAdmin, onVotePoll, onEndPoll }) {
	const canEnd = Boolean(onEndPoll && currentUserId && (poll.createdBy === currentUserId || isAdmin));
	const handleVote = async (_pollId, optionIds) => {
		await onVotePoll?.(message.id, optionIds);
	};
	const handleEndPoll = async () => {
		await onEndPoll?.(message.id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PollCard, {
		poll,
		userId: currentUserId ?? null,
		showResults: false,
		canEnd,
		onVote: onVotePoll ? handleVote : void 0,
		onEndPoll: onEndPoll ? handleEndPoll : void 0
	});
}
function getSharePlatformLabel(platform) {
	if (platform === "email") return "Email";
	return platform;
}
function renderMessageAttachmentsContent(message) {
	if (!message.attachments || message.attachments.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageAttachments, { attachments: message.attachments.map((attachment) => ({
		name: attachment.name ?? "File",
		url: attachment.url,
		type: attachment.mimeType ?? null,
		size: attachment.size ? String(attachment.size) : null
	})) });
}
function renderMessageContentBlock({ message, originalMessage, highlightTerms, currentUserId, isAdmin = false, onVotePoll, onEndPoll }) {
	const content = originalMessage?.content ?? message.content ?? "";
	const poll = parsePollMessage(content);
	if (poll) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessagePollCardBlock, {
		message,
		poll,
		currentUserId,
		isAdmin,
		onVotePoll,
		onEndPoll
	});
	const allUrls = extractUrlsFromContent(content);
	const imageUrlPreviews = allUrls.filter((url) => isLikelyImageUrl(url));
	const linkPreviews = allUrls.filter((url) => !isLikelyImageUrl(url));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageContent, {
			content,
			mentions: originalMessage?.mentions ?? message.mentions,
			highlightTerms
		}),
		imageUrlPreviews.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 flex flex-wrap gap-2",
			children: imageUrlPreviews.map((url) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUrlPreview, { url }, `${message.id}-img-${url}`))
		}) : null,
		linkPreviews.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 space-y-2",
			children: linkPreviews.map((url) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkPreviewCard, { url }, `${message.id}-link-${url}`))
		}) : null
	] });
}
function renderDeletedMessageInfo(message, deletedInfoByMessage) {
	const info = deletedInfoByMessage?.[message.id] ?? {
		deletedBy: message.deletedBy ?? null,
		deletedAt: message.deletedAt ?? null
	};
	if (!info.deletedBy && !info.deletedAt) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm italic text-muted-foreground",
		children: "Message removed"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeletedMessageInfo, {
		deletedBy: info.deletedBy,
		deletedAt: info.deletedAt
	});
}
function renderMessageEditForm(message, editingMessageId, editingValue, onChange, onConfirm, onCancel, isUpdating, editingPreview) {
	if (editingMessageId !== message.id) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageEditForm, {
		value: editingValue,
		onChange,
		onConfirm,
		onCancel,
		isUpdating,
		editingPreview
	});
}
function SharedPlatformBadges({ platforms }) {
	if (!platforms || platforms.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-1 flex items-center gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[10px] text-muted-foreground",
			children: "Sent to:"
		}), platforms.map((platform) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			variant: "outline",
			className: "h-4 px-1 py-0 text-[10px]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3" })
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Shared to ", getSharePlatformLabel(platform)] }) })] }) }, platform))]
	});
}
/**
* Displays a list of pinned messages in the channel
*/
function PinnedMessages({ messages, workspaceId, onMessageClick, className, showEmptyState = false }) {
	const pinnedMessages = messages.filter((m) => m.isPinned && !m.isDeleted);
	if (pinnedMessages.length === 0) return showEmptyState ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("overflow-hidden", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 border-b border-muted/20 px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-medium",
				children: "Pinned Messages"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "p-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				icon: Pin,
				title: "No pinned messages",
				description: "Pin important messages to keep them easy to find.",
				variant: "inline",
				className: "rounded-lg border-dashed bg-muted/10 p-3 [&_p:last-child]:text-xs"
			})
		})]
	}) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("overflow-hidden border-b bg-muted/30", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 border-b bg-muted/50 px-4 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "text-sm font-medium",
				children: [
					"Pinned Messages (",
					pinnedMessages.length,
					")"
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-h-48 overflow-y-auto divide-y",
			children: pinnedMessages.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinnedMessageItem, {
				message,
				workspaceId,
				onClick: onMessageClick
			}, message.id))
		})]
	});
}
function PinnedMessageItem({ message, workspaceId, onClick }) {
	const unpinMessage = useMutation(api.collaborationMessages.unpinMessage);
	const [isUnpinning, setIsUnpinning] = (0, import_react.useState)(false);
	const handleUnpin = async (e) => {
		e.stopPropagation();
		if (!workspaceId || isUnpinning) return;
		setIsUnpinning(true);
		await unpinMessage({
			workspaceId: String(workspaceId),
			legacyId: message.id
		}).then(() => {
			notifySuccess({
				title: "Message unpinned",
				message: "The message has been removed from pinned messages."
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "PinnedMessageItem:handleUnpin",
				title: "Failed to unpin message",
				fallbackMessage: "Failed to unpin message"
			});
		}).finally(() => {
			setIsUnpinning(false);
		});
	};
	const onOpenPinnedMessage = () => {
		onClick?.(message.id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "group flex items-start gap-3 p-3 transition-colors hover:bg-muted/50",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "flex min-w-0 flex-1 items-start gap-3 text-left",
			onClick: onOpenPinnedMessage,
			"aria-label": `Open pinned message from ${message.senderName}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-primary ring-2 ring-background",
				children: message.senderName.charAt(0).toUpperCase()
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-foreground",
						children: message.senderName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "line-clamp-2 text-xs text-muted-foreground",
						children: message.content
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: message.pinnedAt && formatRelativeTime(message.pinnedAt)
							}),
							message.attachments && message.attachments.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground",
								children: ["📎 ", message.attachments.length]
							}) : null,
							message.reactions && message.reactions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground",
								children: [message.reactions.reduce((sum, r) => sum + r.count, 0), " reactions"]
							}) : null
						]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
				delayDuration: 200,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "icon",
						className: "size-7 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
						onClick: handleUnpin,
						disabled: isUnpinning || !workspaceId,
						"aria-label": "Unpin message",
						children: isUnpinning ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							className: "size-4 animate-spin",
							"aria-hidden": true
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinOff, {
							className: "size-4",
							"aria-hidden": true
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
					side: "bottom",
					children: "Unpin message"
				})] })
			})
		})]
	});
}
/**
* Pin/unpin button for individual messages
*/
function PinMessageButton({ message, workspaceId, userId, onPinChange, variant = "icon", className }) {
	const pinMessageMutation = useMutation(api.collaborationMessages.pinMessage);
	const unpinMessageMutation = useMutation(api.collaborationMessages.unpinMessage);
	const [isPending, startTransition] = (0, import_react.useTransition)();
	const isPinned = message.isPinned ?? false;
	const handleTogglePin = async (e) => {
		e?.stopPropagation();
		if (!workspaceId || isPending) return;
		startTransition(async () => {
			await (isPinned ? unpinMessageMutation({
				workspaceId: String(workspaceId),
				legacyId: message.id
			}).then(() => {
				notifySuccess({
					title: "Message unpinned",
					message: "The message has been removed from pinned messages."
				});
				onPinChange?.(message.id, false);
			}) : pinMessageMutation({
				workspaceId: String(workspaceId),
				legacyId: message.id,
				userId: String(userId)
			}).then(() => {
				notifySuccess({
					title: "Message pinned",
					message: "The message has been pinned to the channel."
				});
				onPinChange?.(message.id, true);
			})).catch((error) => {
				reportConvexFailure({
					error,
					context: "PinMessageButton:handleTogglePin",
					title: "Failed to update pin",
					fallbackMessage: "Failed to update pin"
				});
			});
		});
	};
	if (variant === "button") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		variant: isPinned ? "default" : "outline",
		size: "sm",
		onClick: handleTogglePin,
		disabled: isPending,
		className: cn("gap-2", className),
		children: [isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : isPinned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { className: "size-4" }), isPinned ? "Unpin" : "Pin"]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
		delayDuration: 200,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				size: "icon",
				className: cn("size-7", isPinned && "text-primary", className),
				onClick: handleTogglePin,
				disabled: isPending,
				"aria-label": isPinned ? "Unpin message" : "Pin message",
				children: isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					className: "size-4 animate-spin",
					"aria-hidden": true
				}) : isPinned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, {
					className: "size-4 fill-primary",
					"aria-hidden": true
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, {
					className: "size-4",
					"aria-hidden": true
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
			side: "bottom",
			children: isPinned ? "Unpin from channel" : "Pin to channel"
		})] })
	});
}
function UnifiedMessageActionBar({ headerType, message, currentUserId, currentUserRole, activeDeletingMessageId, messageUpdatingId, sharingTo, onReply, onStartEdit, onRequestDelete, onShare, onCreateTask, onForward, pinWorkspaceId, pinMessage }) {
	const canManageMessage = Boolean(currentUserId && !message.deleted && (message.senderId === currentUserId || currentUserRole === "admin"));
	const isBusy = activeDeletingMessageId === message.id || messageUpdatingId === message.id;
	const handleReplyClick = () => {
		onReply?.(message);
	};
	const handleEditClick = () => {
		onStartEdit?.(message);
	};
	const handleDeleteClick = () => {
		onRequestDelete?.(message.id);
	};
	const handleShareEmailClick = () => {
		onShare?.(message, "email");
	};
	const handleCreateTaskClick = () => {
		onCreateTask?.(message);
	};
	const handleForwardClick = () => {
		onForward?.(message);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-1",
		children: [
			onCreateTask && !message.deleted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
				delayDuration: 150,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "icon",
						className: "size-6 transition-transform hover:scale-105",
						disabled: isBusy,
						onClick: handleCreateTaskClick,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListTodo, { className: "size-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "sr-only",
							children: "Create task from message"
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Create task" }) })] })
			}) : null,
			headerType === "channel" && onForward && !message.deleted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
				delayDuration: 150,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "icon",
						className: "size-6 transition-transform hover:scale-105",
						disabled: isBusy,
						onClick: handleForwardClick,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Forward, { className: "size-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "sr-only",
							children: "Forward message"
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Forward to channel" }) })] })
			}) : null,
			headerType === "channel" && pinWorkspaceId && pinMessage && !message.deleted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinMessageButton, {
				message: pinMessage,
				workspaceId: pinWorkspaceId,
				userId: currentUserId,
				variant: "icon"
			}) : null,
			headerType === "channel" && onReply ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
				delayDuration: 150,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "icon",
						className: "size-6 transition-transform hover:scale-105",
						disabled: isBusy,
						onClick: handleReplyClick,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reply, { className: "size-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "sr-only",
							children: "Reply in thread"
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Reply in thread" }) })] })
			}) : null,
			onStartEdit && canManageMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
				delayDuration: 150,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "icon",
						className: "size-6 transition-transform hover:scale-105",
						disabled: isBusy,
						onClick: handleEditClick,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "sr-only",
							children: "Edit message"
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Edit message" }) })] })
			}) : null,
			onRequestDelete && canManageMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
				delayDuration: 150,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "icon",
						className: "size-6 text-destructive transition-transform hover:scale-105 hover:text-destructive",
						disabled: isBusy,
						onClick: handleDeleteClick,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "sr-only",
							children: "Delete message"
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Delete message" }) })] })
			}) : null,
			onShare ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: "size-6 transition-transform hover:scale-105",
					disabled: isBusy,
					"aria-label": `Share message from ${message.senderName ?? "sender"}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, {
						className: "size-3",
						"aria-hidden": true
					})
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onClick: handleShareEmailClick,
				disabled: sharingTo === `${message.id}-email`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "mr-2 size-4" }), "Share via Email"]
			}) })] }) : null
		]
	});
}
function ReactionButton({ reaction, currentUserId, pendingEmoji, disabled, onToggle }) {
	const isPendingReaction = pendingEmoji === reaction.emoji;
	const isActive = Boolean(currentUserId && reaction.userIds.includes(currentUserId));
	const onToggleReaction = () => {
		onToggle(reaction.emoji);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			size: "sm",
			variant: isActive ? "secondary" : "outline",
			className: cn("h-7 rounded-full px-2.5 text-xs motion-chromatic hover:scale-105", isActive && "border-accent/30 bg-accent/10 hover:bg-accent/20"),
			disabled,
			"aria-pressed": isActive,
			onClick: onToggleReaction,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-1.5",
				children: [isPendingReaction ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-base leading-none",
					children: reaction.emoji
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium tabular-nums leading-none",
					children: reaction.count
				})]
			})
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
		side: "top",
		className: "text-xs",
		children: isActive ? "Remove your reaction" : "Add reaction"
	})] });
}
function MessageReactions({ reactions, currentUserId, pendingEmoji, disabled = false, onToggle }) {
	if (!reactions || reactions.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap items-center gap-1.5 pt-1",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
			delayDuration: 300,
			children: reactions.map((reaction) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReactionButton, {
				reaction,
				currentUserId,
				pendingEmoji,
				disabled,
				onToggle
			}, reaction.emoji))
		})
	});
}
function UnifiedThreadReplyCard({ reply, currentUserId, editingMessageId, activeDeletingMessageId, messageUpdatingId, reactionPendingEmoji, onToggleReaction, onStartEdit, onRequestDelete, renderEditForm, renderDeletedInfo, renderMessageContent, renderMessageAttachments }) {
	const renderContext = useMessageListRenderContext();
	const message = collaborationToUnifiedMessage(reply);
	const canManageMessage = Boolean(currentUserId && message.senderId === currentUserId);
	const isEditing = editingMessageId === message.id;
	const isDeleting = activeDeletingMessageId === message.id;
	const isUpdating = messageUpdatingId === message.id;
	const effectiveRenderEditForm = renderEditForm ?? renderContext?.renderEditForm;
	const effectiveRenderDeletedInfo = renderDeletedInfo ?? renderContext?.renderDeletedInfo;
	const effectiveRenderMessageContent = renderMessageContent ?? renderContext?.renderMessageContent;
	const effectiveRenderMessageAttachments = renderMessageAttachments ?? renderContext?.renderMessageAttachments;
	const handleToggleReaction = (emoji) => {
		onToggleReaction(message.id, emoji);
	};
	const handleEditReply = () => {
		onStartEdit?.(message);
	};
	const handleDeleteReply = () => {
		onRequestDelete?.(message.id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("group relative rounded-md border border-muted/40 bg-muted/15 px-3 py-2", chromaticTransitionClass, !message.deleted && "hover:border-accent/20 hover:bg-muted/25"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 space-y-2 pr-14",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-foreground",
								children: reply.senderName
							}),
							reply.senderRole ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: reply.senderRole }) : null,
							reply.createdAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientFormattedDate, {
								value: reply.createdAt,
								formatStr: "h:mm a"
							}) : null,
							message.edited && !message.deleted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "edited" }) : null
						]
					}),
					isEditing ? effectiveRenderEditForm?.(message) ?? null : message.deleted ? effectiveRenderDeletedInfo?.(message) ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm italic text-muted-foreground",
						children: "Message removed"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [effectiveRenderMessageContent ? (0, import_react.createElement)(effectiveRenderMessageContent, { message }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-full min-w-0 overflow-hidden break-words whitespace-pre-wrap text-sm [overflow-wrap:anywhere]",
						children: message.content
					}), effectiveRenderMessageAttachments?.(message)] }),
					!isEditing && !message.deleted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageReactions, {
						reactions: reply.reactions ?? [],
						currentUserId,
						pendingEmoji: reactionPendingEmoji,
						disabled: isDeleting || isUpdating,
						onToggle: handleToggleReaction
					}) : null
				]
			}),
			!isEditing && !message.deleted && canManageMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity duration-[var(--motion-duration-fast)] group-hover:opacity-100 motion-reduce:transition-none",
				children: [onStartEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
					delayDuration: 150,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "size-6 transition-transform hover:scale-105",
							disabled: isDeleting || isUpdating,
							onClick: handleEditReply,
							"aria-label": "Edit reply",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {
								className: "size-3.5",
								"aria-hidden": true
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Edit reply" }) })] })
				}) : null, onRequestDelete ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
					delayDuration: 150,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "size-6 text-destructive transition-transform hover:scale-105 hover:text-destructive",
							disabled: isDeleting || isUpdating,
							onClick: handleDeleteReply,
							"aria-label": "Delete reply",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
								className: "size-3.5",
								"aria-hidden": true
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Delete reply" }) })] })
				}) : null]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeletingOverlay, { isDeleting })
		]
	}, reply.id);
}
function ChannelAvatar({ channel, className, fallbackClassName }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
		className,
		children: [channel.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
			src: channel.avatarUrl,
			alt: channel.name,
			className: "object-cover"
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AvatarFallback, {
			className: cn("bg-muted text-muted-foreground", fallbackClassName),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, {
				className: "size-4",
				"aria-hidden": true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: getInitials$3(channel.name)
			})]
		})]
	});
}
/** Channel / group info modal — dossier-style workspace surface */
var CHANNEL_INFO_THEME = {
	hero: cn("relative overflow-hidden border-b border-border/50 px-5 pb-5 pt-6", "bg-linear-to-br from-primary/[0.08] via-card to-info/[0.04]"),
	heroGlow: "pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-primary/15 blur-3xl",
	heroTitle: "text-xl font-semibold tracking-tight text-foreground",
	heroSubtitle: "text-sm text-muted-foreground",
	statChip: cn("inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-2.5 py-1", "text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"),
	tabList: cn("mx-4 mt-4 grid h-10 w-auto grid-cols-3 rounded-xl bg-muted/50 p-1"),
	tabTrigger: cn("rounded-lg px-2 py-1.5 text-xs font-semibold data-[state=active]:shadow-sm"),
	sectionEyebrow: "text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/75",
	memberRow: cn("flex items-center gap-3 rounded-xl border border-transparent p-2.5", "transition-[border-color,background-color] hover:border-border/50 hover:bg-muted/30", "motion-reduce:transition-none"),
	settingsCard: cn("rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm ring-1 ring-border/30")
};
function ChannelInfoHero({ channel, displayName, memberCount, isAdmin, uploading, removing, onPickPhoto, onRemovePhoto }) {
	const plainName = channel.name.replace(/^#/, "");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: CHANNEL_INFO_THEME.hero,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: CHANNEL_INFO_THEME.heroGlow,
			"aria-hidden": true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex flex-col gap-4 sm:flex-row sm:items-start",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelAvatar, {
					channel,
					className: "size-20 ring-2 ring-background/80 shadow-md",
					fallbackClassName: "bg-primary/10 text-primary"
				}), isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "secondary",
					size: "icon",
					className: "absolute -bottom-0.5 -right-0.5 size-9 rounded-full border border-border/60 shadow-md",
					onClick: onPickPhoto,
					disabled: uploading || removing,
					"aria-label": "Change channel photo",
					children: uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "size-4 animate-spin",
						"aria-hidden": true
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {
						className: "size-4",
						"aria-hidden": true
					})
				}) : null]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground/70",
							children: "Channel"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: cn(CHANNEL_INFO_THEME.heroTitle, "mt-1 truncate"),
							children: plainName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn(CHANNEL_INFO_THEME.heroSubtitle, "mt-1 truncate"),
							children: displayName
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: CHANNEL_INFO_THEME.statChip,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
									className: "size-3 text-primary/80",
									"aria-hidden": true
								}),
								memberCount,
								" ",
								memberCount === 1 ? "member" : "members"
							]
						}), channel.isCustom ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: CHANNEL_INFO_THEME.statChip,
							children: [channel.visibility === "private" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {
								className: "size-3",
								"aria-hidden": true
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
								className: "size-3",
								"aria-hidden": true
							}), channel.visibility === "private" ? "Private" : "Public"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: CHANNEL_INFO_THEME.statChip,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, {
									className: "size-3",
									"aria-hidden": true
								}),
								channel.type,
								" channel"
							]
						})]
					}),
					isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: channel.avatarUrl ? "Replace or remove this channel photo." : "Add a photo so teammates recognize this channel."
						}), channel.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "ghost",
							size: "sm",
							className: "h-8 gap-1.5 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive",
							onClick: onRemovePhoto,
							disabled: uploading || removing,
							children: [removing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "size-3.5 animate-spin",
								"aria-hidden": true
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
								className: "size-3.5",
								"aria-hidden": true
							}), "Remove photo"]
						}) : null]
					}) : null
				]
			})]
		})]
	});
}
function ChannelInfoMembersPanel({ channelParticipants, canManageMembers, onManageMembers }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 px-1",
		children: [canManageMembers && onManageMembers ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			variant: "outline",
			size: "sm",
			className: "w-full gap-2 rounded-xl border-dashed",
			onClick: onManageMembers,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, {
				className: "size-4",
				"aria-hidden": true
			}), "Manage members"]
		}) : null, channelParticipants.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: Users,
			title: "No members yet",
			description: "Invite teammates to this channel to collaborate here.",
			variant: "inline",
			className: "rounded-2xl border-dashed bg-muted/10 py-8"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-0.5",
			"aria-label": "Channel members",
			children: channelParticipants.map((participant) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: CHANNEL_INFO_THEME.memberRow,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
						className: "size-10 shrink-0 ring-1 ring-border/50",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
							className: "bg-primary/8 text-xs font-bold text-primary",
							children: getInitials$3(participant.name)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-semibold text-foreground",
							children: participant.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: participant.role || "Teammate"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: "shrink-0 text-[10px] font-medium capitalize",
						children: participant.role || "member"
					})
				]
			}, participant.name))
		})]
	});
}
function ChannelInfoFilesPanel({ sharedFiles }) {
	if (sharedFiles.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		icon: FileStack,
		title: "No shared files yet",
		description: "Images, PDFs, and documents posted in this channel appear here.",
		variant: "inline",
		className: "rounded-2xl border-dashed bg-muted/10 py-10"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatMediaGallery, {
		attachments: sharedFiles.map((file) => ({
			name: file.name,
			url: file.url,
			type: file.type,
			size: file.size
		})),
		compact: false,
		className: "px-0.5"
	});
}
function ChannelInfoAboutPanel({ channel, canManageMembers, onManageMembers }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 px-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: CHANNEL_INFO_THEME.settingsCard,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
						className: "size-5",
						"aria-hidden": true
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1 space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: CHANNEL_INFO_THEME.sectionEyebrow,
							children: "About"
						}),
						channel.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed text-foreground",
							children: channel.description
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm italic text-muted-foreground",
							children: "No description for this channel."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2 pt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "text-[10px] font-semibold uppercase tracking-wide",
								children: channel.isCustom ? "Custom channel" : `${channel.type} channel`
							}), channel.isCustom && channel.visibility ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								className: "gap-1 text-[10px] font-semibold uppercase tracking-wide",
								children: [channel.visibility === "private" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {
									className: "size-3",
									"aria-hidden": true
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
									className: "size-3",
									"aria-hidden": true
								}), channel.visibility]
							}) : null]
						})
					]
				})]
			}), channel.isCustom && canManageMembers && onManageMembers ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "outline",
				size: "sm",
				className: "mt-4 w-full gap-2 rounded-xl",
				onClick: onManageMembers,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, {
					className: "size-4",
					"aria-hidden": true
				}), "Manage channel members"]
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: CHANNEL_INFO_THEME.settingsCard,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-primary ring-1 ring-accent/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
						className: "size-5",
						"aria-hidden": true
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: CHANNEL_INFO_THEME.sectionEyebrow,
							children: "Notifications"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "Control collaboration alerts alongside tasks, ads, and meetings in workspace settings."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-col gap-2 sm:flex-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								className: "rounded-xl",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
									href: "/settings?tab=notifications",
									children: "Notification settings"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								size: "sm",
								className: "rounded-xl",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
									href: "/dashboard/notifications",
									children: "Notification center"
								})
							})]
						})
					]
				})]
			})
		})]
	});
}
function ChannelInfoTabs({ channel, channelMessages, channelParticipants, currentUserId, onPinnedMessageClick, sharedFiles, workspaceId, canManageMembers, onManageMembers }) {
	const fileCount = sharedFiles.length;
	const memberCount = channelParticipants.length;
	const pinnedCount = channelMessages.filter((message) => message.isPinned && !message.isDeleted).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
		defaultValue: "members",
		className: "flex min-h-0 flex-1 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
			className: CHANNEL_INFO_THEME.tabList,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
					value: "members",
					className: CHANNEL_INFO_THEME.tabTrigger,
					children: ["Members", memberCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-1.5 tabular-nums text-muted-foreground",
						children: [
							"(",
							memberCount,
							")"
						]
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
					value: "pinned",
					className: CHANNEL_INFO_THEME.tabTrigger,
					children: ["Pinned", pinnedCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-1.5 tabular-nums text-muted-foreground",
						children: [
							"(",
							pinnedCount,
							")"
						]
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
					value: "files",
					className: CHANNEL_INFO_THEME.tabTrigger,
					children: ["Files", fileCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-1.5 tabular-nums text-muted-foreground",
						children: [
							"(",
							fileCount,
							")"
						]
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "about",
					className: CHANNEL_INFO_THEME.tabTrigger,
					children: "About"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "members",
					className: "mt-0 focus-visible:outline-none",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelInfoMembersPanel, {
						channelParticipants,
						canManageMembers,
						onManageMembers
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "pinned",
					className: "mt-0 focus-visible:outline-none",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinnedMessages, {
						messages: channelMessages,
						workspaceId,
						userId: currentUserId,
						onMessageClick: onPinnedMessageClick,
						showEmptyState: true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "files",
					className: "mt-0 focus-visible:outline-none",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelInfoFilesPanel, { sharedFiles })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "about",
					className: "mt-0 focus-visible:outline-none",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelInfoAboutPanel, {
						channel,
						canManageMembers,
						onManageMembers
					})
				})
			]
		})]
	});
}
var MAX_AVATAR_BYTES = 2 * 1024 * 1024;
var ALLOWED_AVATAR_TYPES = new Set([
	"image/jpeg",
	"image/png",
	"image/webp"
]);
function ChannelInfoDialog({ open, onOpenChange, channel, channelMessages, channelParticipants, currentUserId, onPinnedMessageClick, sharedFiles, workspaceId, isAdmin, canManageMembers, onManageMembers }) {
	const fileInputRef = (0, import_react.useRef)(null);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const [removing, setRemoving] = (0, import_react.useState)(false);
	const generateUploadUrl = useMutation(collaborationApi.generateUploadUrl);
	const syncMetadata = useMutation(collaborationApi.syncMetadata);
	const setChannelAvatar = useMutation(collaborationChannelAvatarsApi.setAvatar);
	const displayName = channel.name.startsWith("#") ? channel.name : `#${channel.name}`;
	const memberCount = channelParticipants.length;
	const handlePickPhoto = () => {
		fileInputRef.current?.click();
	};
	const handleFileChange = async (event) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file || !isAdmin) return;
		if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
			notifyFailure({
				title: "Unsupported image",
				message: "Use a JPEG, PNG, or WebP file."
			});
			return;
		}
		if (file.size > MAX_AVATAR_BYTES) {
			notifyFailure({
				title: "Image too large",
				message: "Channel photos must be 2 MB or smaller."
			});
			return;
		}
		setUploading(true);
		try {
			const storageId = await uploadStorageFile({
				file,
				contentType: file.type,
				generateUploadUrl: () => generateUploadUrl({}),
				syncMetadata: (args) => syncMetadata(args)
			});
			await setChannelAvatar({
				workspaceId,
				channelKey: channel.id,
				storageId
			});
			notifySuccess({
				title: "Channel photo updated",
				message: `${displayName} now has a new photo.`
			});
		} catch (error) {
			reportConvexFailure({
				error,
				context: "channel-info-dialog.tsx:catch",
				title: "Could not update photo",
				fallbackMessage: "Could not update photo"
			});
		}
		setUploading(false);
	};
	const handleRemovePhoto = async () => {
		if (!isAdmin || !channel.avatarUrl) return;
		setRemoving(true);
		try {
			await setChannelAvatar({
				workspaceId,
				channelKey: channel.id,
				storageId: null
			});
			notifySuccess({
				title: "Channel photo removed",
				message: `${displayName} is using the default icon again.`
			});
		} catch (error) {
			reportConvexFailure({
				error,
				context: "channel-info-dialog.tsx:catch",
				title: "Could not remove photo",
				fallbackMessage: "Could not remove photo"
			});
		}
		setRemoving(false);
	};
	const handleRemovePhotoClick = () => {
		handleRemovePhoto();
	};
	const handleManageMembers = () => {
		onOpenChange(false);
		onManageMembers?.();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "flex max-h-[min(92dvh,44rem)] w-[min(100vw-1.25rem,32rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg [&>button]:top-4 [&>button]:right-4 [&>button]:rounded-full [&>button]:bg-background/80 [&>button]:backdrop-blur-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
					className: "sr-only",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: [displayName, " channel info"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Members, shared files, and settings for this channel" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelInfoHero, {
					channel,
					displayName,
					memberCount,
					isAdmin,
					uploading,
					removing,
					onPickPhoto: handlePickPhoto,
					onRemovePhoto: handleRemovePhotoClick
				}),
				isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: fileInputRef,
					type: "file",
					accept: "image/jpeg,image/png,image/webp",
					"aria-label": "Upload channel photo",
					className: "sr-only",
					onChange: handleFileChange
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelInfoTabs, {
					channel,
					channelMessages,
					channelParticipants,
					currentUserId,
					onPinnedMessageClick,
					sharedFiles,
					workspaceId,
					canManageMembers,
					onManageMembers: onManageMembers ? handleManageMembers : void 0
				})
			]
		})
	});
}
function getInitials(name) {
	return name.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2);
}
function UnifiedConversationHeader({ header, canSearchMessages = false, messageSearchOpen = false, onToggleMessageSearch }) {
	const [linkCopied, setLinkCopied] = (0, import_react.useState)(false);
	const [channelInfoOpen, setChannelInfoOpen] = (0, import_react.useState)(false);
	const copyResetTimerRef = (0, import_react.useRef)(null);
	const handleOpenChannelInfo = () => {
		setChannelInfoOpen(true);
	};
	const handleArchiveToggle = () => {
		header.onArchive?.(!header.isArchived);
	};
	const handleMuteToggle = () => {
		header.onMute?.(!header.isMuted);
	};
	const handleCopyShareLink = () => {
		if (!header.buildShareableUrl) return;
		const url = header.buildShareableUrl();
		navigator.clipboard.writeText(url).then(() => {
			if (copyResetTimerRef.current) clearTimeout(copyResetTimerRef.current);
			setLinkCopied(true);
			notifySuccess({
				title: "Link copied",
				message: header.type === "channel" ? "Recipients can open this channel from the link." : "Page link copied to clipboard."
			});
			copyResetTimerRef.current = setTimeout(() => {
				setLinkCopied(false);
				copyResetTimerRef.current = null;
			}, 2e3);
		}, () => {
			notifyFailure({
				title: "Could not copy",
				message: "Allow clipboard access or copy the URL from the address bar."
			});
		});
	};
	const handleMarkChannelReadClick = () => {
		header.onMarkChannelRead?.();
	};
	(0, import_react.useEffect)(() => {
		const resetTimerRef = copyResetTimerRef;
		return () => {
			if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
		};
	}, []);
	const subtitleParts = [];
	if (header.type === "channel" && header.participantCount !== void 0) subtitleParts.push(`${header.participantCount} member${header.participantCount === 1 ? "" : "s"}`);
	if (header.type === "channel" && header.messageCount !== void 0) subtitleParts.push(`${header.messageCount} message${header.messageCount === 1 ? "" : "s"}`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "shrink-0 border-b border-muted/40 bg-background/80 p-3 backdrop-blur-md supports-backdrop-filter:bg-background/70 sm:p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-2 sm:gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 items-start gap-2 sm:gap-3",
				children: [
					header.onBack ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "icon",
						className: "mt-0.5 size-9 shrink-0 lg:hidden",
						onClick: header.onBack,
						"aria-label": "Back to inbox",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" })
					}) : null,
					header.type === "channel" && header.channelInfo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelAvatar, {
						channel: header.channelInfo.channel,
						className: "mt-0.5 size-9 ring-1 ring-border/60"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
						className: "mt-0.5 ring-1 ring-border/60",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
							className: cn(header.type === "channel" ? "bg-muted" : "bg-accent/10 text-primary"),
							children: header.type === "channel" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, { className: "size-4" }) : getInitials(header.name)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1 space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "truncate text-base font-semibold tracking-tight text-foreground",
									children: header.type === "channel" ? header.name.startsWith("#") ? header.name : `#${header.name}` : header.name
								}),
								header.type === "channel" && header.channelKind ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: cn("h-5 shrink-0 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide", CHANNEL_TYPE_COLORS[header.channelKind]),
									children: header.channelKind
								}) : null,
								header.type === "dm" && header.role ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "h-5 shrink-0 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide",
									children: header.role
								}) : null
							]
						}), subtitleParts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: subtitleParts.join(" · ")
						}) : header.type === "dm" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Direct message"
						}) : null]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 flex-wrap items-center justify-end gap-1",
				children: [
					canSearchMessages && onToggleMessageSearch ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: messageSearchOpen ? "secondary" : "outline",
						size: "icon",
						className: "size-8",
						onClick: onToggleMessageSearch,
						"aria-label": messageSearchOpen ? "Hide message search" : "Search messages",
						"aria-pressed": messageSearchOpen,
						children: messageSearchOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-3.5" })
					}) : null,
					header.channelInfo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						size: "icon",
						className: "size-8",
						"aria-label": "Channel details",
						onClick: handleOpenChannelInfo,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "size-3.5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelInfoDialog, {
						open: channelInfoOpen,
						onOpenChange: setChannelInfoOpen,
						channel: header.channelInfo.channel,
						channelMessages: header.channelInfo.channelMessages,
						channelParticipants: header.channelInfo.channelParticipants,
						currentUserId: header.channelInfo.currentUserId,
						onPinnedMessageClick: header.channelInfo.onPinnedMessageClick,
						sharedFiles: header.channelInfo.sharedFiles,
						workspaceId: header.channelInfo.workspaceId,
						isAdmin: header.channelInfo.isAdmin,
						canManageMembers: header.channelInfo.canManageMembers,
						onManageMembers: header.channelInfo.onManageMembers
					})] }) : null,
					header.buildShareableUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
						delayDuration: 200,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: "outline",
								size: "sm",
								className: "h-8 gap-1.5",
								onClick: handleCopyShareLink,
								"aria-label": "Copy conversation link",
								children: [linkCopied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden sm:inline",
									children: linkCopied ? "Copied" : "Copy link"
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
							side: "bottom",
							className: "max-w-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Copy a link to this ", header.type === "channel" ? "channel" : "page"] })
						})] })
					}) : null,
					header.type === "channel" && header.onMarkChannelRead && typeof header.channelUnreadCount === "number" && header.channelUnreadCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
						delayDuration: 200,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: "outline",
								size: "sm",
								className: "h-8 gap-1.5",
								disabled: header.markChannelReadPending,
								onClick: handleMarkChannelReadClick,
								"aria-label": "Mark channel as read",
								children: [
									header.markChannelReadPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "size-3.5" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "hidden sm:inline",
										children: "Mark read"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										className: "h-5 px-1.5 text-[10px] tabular-nums",
										children: header.channelUnreadCount
									})
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
							side: "bottom",
							className: "max-w-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Clear your unread count for this channel." })
						})] })
					}) : null,
					header.primaryActionLabel && header.onPrimaryAction ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "h-8 gap-1.5",
						onClick: header.onPrimaryAction,
						"aria-label": header.primaryActionLabel,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: header.primaryActionLabel
						})]
					}) : null,
					header.isArchived ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "secondary",
						className: "text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { className: "mr-1 size-3" }), "Archived"]
					}) : null,
					header.isMuted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "secondary",
						className: "text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellOff, { className: "mr-1 size-3" }), "Muted"]
					}) : null,
					header.onArchive || header.onMute || header.onExport ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "size-8",
							"aria-label": "Conversation actions",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "size-4" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
						align: "end",
						children: [
							header.onArchive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								onClick: handleArchiveToggle,
								children: header.isArchived ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArchiveRestore, { className: "mr-2 size-4" }), "Unarchive"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { className: "mr-2 size-4" }), "Archive"] })
							}) : null,
							header.onMute ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								onClick: handleMuteToggle,
								children: header.isMuted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "mr-2 size-4" }), "Unmute"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellOff, { className: "mr-2 size-4" }), "Mute"] })
							}) : null,
							header.onExport ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: header.onExport,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "mr-2 size-4" }), "Export messages"]
							}) : null
						]
					})] }) : null
				]
			})]
		})
	});
}
function UnifiedComposerSection({ pendingAttachments, uploadingAttachments, isSending, onRemoveAttachment, isComposerFocused, hasPendingAttachments, messageInput, onMessageInputChange, onSend, replyingToMessage, onCancelReply, placeholder, participants, onFocus, onBlur, onDrop, onDragOver, onPaste, onAttachClick, fileInputRef, onAttachmentInputChange, typingIndicator, composerToolbar }) {
	const handleRemoveAttachment = (attachmentId) => {
		onRemoveAttachment?.(attachmentId);
	};
	const handleSend = () => {
		onSend();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "shrink-0 border-t border-muted/40 bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PendingAttachmentsList, {
				attachments: pendingAttachments,
				uploading: uploadingAttachments,
				disabled: isSending,
				onRemove: handleRemoveAttachment
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("w-full rounded-lg border border-muted/40 bg-background shadow-sm focus-within:border-accent/40 focus-within:ring-1 focus-within:ring-primary/20", chromaticTransitionClass, (isComposerFocused || hasPendingAttachments) && "border-accent/30 shadow-md shadow-primary/5"),
				children: [replyingToMessage && onCancelReply ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReplyIndicator, {
					message: replyingToMessage,
					onCancel: onCancelReply
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichComposer, {
					value: messageInput,
					onChange: onMessageInputChange,
					onSend,
					disabled: isSending || uploadingAttachments,
					placeholder,
					participants,
					onFocus,
					onBlur,
					onDrop,
					onDragOver,
					onPaste,
					onAttachClick,
					hasAttachments: hasPendingAttachments
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileInputRef,
				type: "file",
				multiple: true,
				"aria-label": "Attach files to message",
				className: "hidden",
				onChange: onAttachmentInputChange
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 flex-1 items-center gap-2",
					children: [composerToolbar, typingIndicator ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatTypingIndicator, {
						label: typingIndicator,
						variant: "composer"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "min-h-[1rem] text-[11px] leading-snug text-muted-foreground/90",
						children: "Enter to send · Shift+Enter for a new line"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: handleSend,
					disabled: !messageInput.trim() && !hasPendingAttachments || isSending || uploadingAttachments,
					size: "sm",
					className: cn(chromaticTransitionClass, "hover:-translate-y-0.5 active:translate-y-0"),
					children: [isSending || uploadingAttachments ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2",
						children: uploadingAttachments ? "Uploading…" : isSending ? "Sending…" : "Send"
					})]
				})]
			})
		]
	});
}
function UnifiedMessagePaneEmptyState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-0 flex-1 items-center justify-center bg-background/50",
		role: "status",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-8 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted/50",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-8 text-muted-foreground" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-medium text-foreground",
					children: "Select a conversation"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Choose a conversation from the sidebar to start messaging"
				})
			]
		})
	});
}
function UnifiedMessagePaneShimmerBackdrop() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 -z-10 overflow-hidden pointer-events-none",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -top-[100%] -left-[100%] size-[300%] animate-shimmer bg-gradient-to-br from-transparent via-muted/30 to-transparent opacity-50" })
	});
}
function UnifiedMessagePaneConversationHeaderSection({ header, canSearchMessages, messageSearchOpen, onToggleMessageSearch, statusBanner, searchBar }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnifiedConversationHeader, {
			header,
			canSearchMessages,
			messageSearchOpen,
			onToggleMessageSearch
		}),
		statusBanner,
		searchBar
	] });
}
function UnifiedMessagePaneMessagesSection({ header, messageListRenderers, messages, currentUserId, currentUserRole, isLoading, hasMore, onLoadMore, onRefresh, onToggleReaction, reactionPendingByMessage, onReply, onDeleteMessage, activeDeletingMessageId, messageUpdatingId, emptyState, editingMessageId, effectiveFocusMessageId, effectiveFocusThreadId, typingIndicator }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative flex min-h-0 flex-1 overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageListRenderProvider, {
			value: messageListRenderers,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageList, {
				messages,
				currentUserId,
				currentUserRole,
				isLoading,
				hasMore,
				onLoadMore,
				onRefresh,
				onToggleReaction,
				reactionPendingByMessage,
				onReply,
				onDeleteMessage,
				deletingMessageId: activeDeletingMessageId,
				updatingMessageId: messageUpdatingId,
				emptyState,
				variant: header.type === "channel" ? "channel" : "dm",
				editingMessageId,
				focusMessageId: effectiveFocusMessageId,
				focusThreadId: effectiveFocusThreadId,
				typingIndicatorText: typingIndicator
			}, header.conversationKey ?? `${header.type}-${header.name}`)
		})
	});
}
function UnifiedMessagePaneComposerSection({ pendingAttachments, uploadingAttachments, isSending, onRemoveAttachment, isComposerFocused, hasPendingAttachments, messageInput, onMessageInputChange, onSend, placeholder, participants, onFocus, onBlur, onDrop, onDragOver, onPaste, onAttachClick, fileInputRef, onAttachmentInputChange, replyingToMessage, onCancelReply, typingIndicator, composerToolbar, confirmingDeleteMessageId, activeDeletingMessageId, onDeleteConfirmOpenChange, onConfirmDelete, onCancelDelete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnifiedComposerSection, {
		pendingAttachments,
		uploadingAttachments,
		isSending,
		onRemoveAttachment,
		isComposerFocused,
		hasPendingAttachments,
		messageInput,
		onMessageInputChange,
		onSend,
		replyingToMessage,
		onCancelReply,
		placeholder,
		participants,
		onFocus,
		onBlur,
		onDrop,
		onDragOver,
		onPaste,
		onAttachClick,
		fileInputRef,
		onAttachmentInputChange,
		typingIndicator,
		composerToolbar
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnifiedMessagePaneDeleteConfirm, {
		confirmingDeleteMessageId,
		activeDeletingMessageId,
		onOpenChange: onDeleteConfirmOpenChange,
		onConfirm: onConfirmDelete,
		onCancel: onCancelDelete
	})] });
}
function UnifiedMessagePaneDeleteConfirm({ confirmingDeleteMessageId, activeDeletingMessageId, onOpenChange, onConfirm, onCancel }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
		open: Boolean(confirmingDeleteMessageId),
		onOpenChange,
		title: "Delete message",
		description: "This removes the message content for everyone in the conversation and keeps a deleted placeholder in the timeline.",
		confirmLabel: "Delete",
		cancelLabel: "Cancel",
		variant: "destructive",
		isLoading: activeDeletingMessageId === confirmingDeleteMessageId,
		onConfirm,
		onCancel
	});
}
function useUnifiedMessagePaneMessageSearch({ canSearchMessages, conversationKey, headerType, messageSearchQuery, messageSearchActive, resultCount, onMessageSearchChange }) {
	const messageSearchInputRef = (0, import_react.useRef)(null);
	const [messageSearchOpen, setMessageSearchOpen] = (0, import_react.useState)(false);
	const isMessageSearchOpen = canSearchMessages && messageSearchOpen;
	const handleMessageSearchChange = (event) => {
		onMessageSearchChange?.(event.target.value);
	};
	const handleClearMessageSearch = () => {
		onMessageSearchChange?.("");
	};
	const handleDismissMessageSearch = () => {
		setMessageSearchOpen(false);
		onMessageSearchChange?.("");
	};
	const handleToggleMessageSearch = () => {
		setMessageSearchOpen((open) => {
			const next = !open;
			if (!next) onMessageSearchChange?.("");
			return next;
		});
	};
	(0, import_react.useEffect)(() => {
		if (!isMessageSearchOpen) return;
		messageSearchInputRef.current?.focus();
	}, [isMessageSearchOpen]);
	const dismissMessageSearchOnEscape = (0, import_react.useEffectEvent)(() => {
		handleDismissMessageSearch();
	});
	(0, import_react.useEffect)(() => {
		if (!isMessageSearchOpen) return;
		const onGlobalKeyDown = (event) => {
			if (event.key !== "Escape") return;
			dismissMessageSearchOnEscape();
		};
		window.addEventListener("keydown", onGlobalKeyDown);
		return () => window.removeEventListener("keydown", onGlobalKeyDown);
	}, [isMessageSearchOpen]);
	return {
		messageSearchOpen: isMessageSearchOpen,
		handleToggleMessageSearch,
		searchBar: canSearchMessages && onMessageSearchChange && isMessageSearchOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSearchBar, {
			inputRef: messageSearchInputRef,
			value: messageSearchQuery,
			onChange: handleMessageSearchChange,
			resultCount,
			isActive: messageSearchActive,
			placeholder: headerType === "dm" ? "Search messages in this conversation…" : "Search messages in this channel…",
			onClear: handleClearMessageSearch
		}) : null
	};
}
function useUnifiedMessagePaneAttachHandler({ fileInputRef }) {
	return () => {
		fileInputRef.current?.click();
	};
}
/** Remount with `key={conversationKey}` so search UI resets when the conversation changes. */
function UnifiedMessagePaneMessageSearchBindings({ children, ...searchParams }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: children(useUnifiedMessagePaneMessageSearch(searchParams)) });
}
function resolveUnifiedMessagePaneEmptyState(isMessageSearchActive, emptyState) {
	return isMessageSearchActive ? (0, import_react.createElement)(NoSearchResultsState) : emptyState;
}
function UnifiedMessagePaneConversationLayout({ activeDeletingMessageId, confirmingDeleteMessageId, currentUserId, currentUserRole, editingMessageId, effectiveFocusMessageId, effectiveFocusThreadId, emptyState, fileInputRef, handleAttachmentInputChange, handleCancelDelete, handleComposerBlurInternal, handleComposerDragOver, handleComposerDrop, handleComposerFocusInternal, handleComposerPaste, handleConfirmDelete, handleReaction, handleSend, listState, composerState, searchState, header, messageInput, messageListRenderers, messageSearchQuery, messageUpdatingId, messages, onAddAttachments, onDeleteMessage, onLoadMore, onMessageInputChange, onMessageSearchChange, onRefresh, onRemoveAttachment, onReply, replyingToMessage, onCancelReply, participants, pendingAttachments, placeholder, reactionPendingByMessage, statusBanner, typingIndicator, onCreatePoll, workspaceId }) {
	const { loading: isLoading, loadingMore: isLoadingMore, hasMore } = listState;
	const { focused: isComposerFocused, sending: isSending, pendingAttachments: hasPendingAttachments, uploadingAttachments } = composerState;
	const { canSearch: canSearchMessages, active: isMessageSearchActive } = searchState;
	const composerToolbar = (() => {
		if (header.type !== "channel" || !onCreatePoll) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickPollButton, {
			workspaceId: workspaceId ?? null,
			userId: currentUserId,
			onCreate: onCreatePoll
		});
	})();
	const handleAttachClick = useUnifiedMessagePaneAttachHandler({ fileInputRef });
	const handleConfirmDeleteChange = (open) => {
		if (!open) handleCancelDelete();
	};
	const resolvedEmptyState = resolveUnifiedMessagePaneEmptyState(isMessageSearchActive, emptyState);
	const messageSearchKey = header.conversationKey ?? header.type;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnifiedMessagePaneMessageSearchBindings, {
		canSearchMessages,
		conversationKey: header.conversationKey,
		headerType: header.type,
		messageSearchQuery,
		messageSearchActive: isMessageSearchActive,
		resultCount: messages.length,
		onMessageSearchChange,
		children: (messageSearch) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background/50 max-lg:min-h-[min(72dvh,640px)] lg:h-[640px]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnifiedMessagePaneShimmerBackdrop, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnifiedMessagePaneConversationHeaderSection, {
					header,
					canSearchMessages,
					messageSearchOpen: messageSearch.messageSearchOpen,
					onToggleMessageSearch: canSearchMessages && onMessageSearchChange ? messageSearch.handleToggleMessageSearch : void 0,
					statusBanner,
					searchBar: messageSearch.searchBar
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnifiedMessagePaneMessagesSection, {
					header,
					messageListRenderers,
					messages,
					currentUserId,
					currentUserRole,
					isLoading: isLoading || isLoadingMore,
					hasMore,
					onLoadMore,
					onRefresh,
					onToggleReaction: handleReaction,
					reactionPendingByMessage,
					onReply,
					onDeleteMessage,
					activeDeletingMessageId,
					messageUpdatingId,
					emptyState: resolvedEmptyState,
					editingMessageId,
					effectiveFocusMessageId,
					effectiveFocusThreadId
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnifiedMessagePaneComposerSection, {
					pendingAttachments,
					uploadingAttachments,
					isSending,
					onRemoveAttachment,
					isComposerFocused,
					hasPendingAttachments,
					messageInput,
					onMessageInputChange,
					onSend: handleSend,
					replyingToMessage,
					onCancelReply,
					placeholder,
					participants,
					onFocus: handleComposerFocusInternal,
					onBlur: handleComposerBlurInternal,
					onDrop: handleComposerDrop,
					onDragOver: handleComposerDragOver,
					onPaste: handleComposerPaste,
					onAttachClick: onAddAttachments ? handleAttachClick : void 0,
					fileInputRef,
					onAttachmentInputChange: handleAttachmentInputChange,
					typingIndicator,
					composerToolbar,
					confirmingDeleteMessageId,
					activeDeletingMessageId,
					onDeleteConfirmOpenChange: handleConfirmDeleteChange,
					onConfirmDelete: handleConfirmDelete,
					onCancelDelete: handleCancelDelete
				})
			]
		})
	}, messageSearchKey);
}
function usePollMessageActions({ workspaceId, mode }) {
	const voteOnChannelPoll = useMutation(collaborationApi.voteOnPoll);
	const endChannelPoll = useMutation(collaborationApi.endPollMessage);
	const voteOnDmPoll = useMutation(directMessagesApi.voteOnPoll);
	const endDmPoll = useMutation(directMessagesApi.endPollMessage);
	const handleVote = async (messageLegacyId, optionIds) => {
		if (!workspaceId || optionIds.length === 0) return;
		try {
			if (mode === "channel") await voteOnChannelPoll({
				workspaceId,
				legacyId: messageLegacyId,
				optionIds
			});
			else await voteOnDmPoll({
				workspaceId,
				messageLegacyId,
				optionIds
			});
		} catch (error) {
			reportConvexFailure({
				error,
				context: "usePollMessageActions:handleVote",
				title: "Could not record vote"
			});
			throw error;
		}
	};
	const handleEndPoll = async (messageLegacyId) => {
		if (!workspaceId) return;
		try {
			if (mode === "channel") await endChannelPoll({
				workspaceId,
				legacyId: messageLegacyId
			});
			else await endDmPoll({
				workspaceId,
				messageLegacyId
			});
		} catch (error) {
			reportConvexFailure({
				error,
				context: "usePollMessageActions:handleEndPoll",
				title: "Could not end poll"
			});
			throw error;
		}
	};
	return {
		handleVote,
		handleEndPoll
	};
}
function useMediaQuery(query) {
	return (0, import_react.useSyncExternalStore)((onStoreChange) => {
		if (typeof window === "undefined") return () => void 0;
		const media = window.matchMedia(query);
		const handleChange = () => {
			onStoreChange();
		};
		if (typeof media.addEventListener === "function") {
			media.addEventListener("change", handleChange);
			return () => {
				media.removeEventListener("change", handleChange);
			};
		}
		media.addListener(handleChange);
		return () => {
			media.removeListener(handleChange);
		};
	}, () => {
		if (typeof window === "undefined") return false;
		return window.matchMedia(query).matches;
	}, () => false);
}
var SWIPE_THRESHOLD = 50;
var SWIPE_VELOCITY_THRESHOLD = .3;
function useSwipe(handlers, options) {
	const threshold = options?.threshold ?? SWIPE_THRESHOLD;
	const preventScroll = options?.preventScroll ?? false;
	const [state, setState] = (0, import_react.useState)({
		startX: 0,
		startY: 0,
		currentX: 0,
		currentY: 0,
		isSwiping: false,
		direction: null,
		distance: 0
	});
	const startTimeRef = (0, import_react.useRef)(0);
	const touchIdRef = (0, import_react.useRef)(null);
	const handleTouchStart = (e) => {
		if (e.touches.length !== 1) return;
		const touch = e.touches[0];
		if (!touch) return;
		touchIdRef.current = touch.identifier;
		startTimeRef.current = Date.now();
		setState({
			startX: touch.clientX,
			startY: touch.clientY,
			currentX: touch.clientX,
			currentY: touch.clientY,
			isSwiping: true,
			direction: null,
			distance: 0
		});
	};
	const handleTouchMove = (e) => {
		if (!state.isSwiping) return;
		const touch = Array.from(e.touches).find((t) => t.identifier === touchIdRef.current);
		if (!touch) return;
		const deltaX = touch.clientX - state.startX;
		const deltaY = touch.clientY - state.startY;
		const absX = Math.abs(deltaX);
		const absY = Math.abs(deltaY);
		let direction = null;
		if (absX > threshold || absY > threshold) if (absX > absY) direction = deltaX > 0 ? "right" : "left";
		else direction = deltaY > 0 ? "down" : "up";
		if (preventScroll && (direction === "left" || direction === "right")) e.preventDefault();
		setState((prev) => ({
			...prev,
			currentX: touch.clientX,
			currentY: touch.clientY,
			direction,
			distance: Math.max(absX, absY)
		}));
	};
	const handleTouchEnd = () => {
		if (!state.isSwiping) return;
		const duration = Date.now() - startTimeRef.current;
		const velocity = state.distance / duration;
		if (state.distance > threshold && velocity > SWIPE_VELOCITY_THRESHOLD) switch (state.direction) {
			case "left":
				handlers.onSwipeLeft?.();
				break;
			case "right":
				handlers.onSwipeRight?.();
				break;
			case "up":
				handlers.onSwipeUp?.();
				break;
			case "down":
				handlers.onSwipeDown?.();
				break;
		}
		setState((prev) => ({
			...prev,
			isSwiping: false,
			direction: null
		}));
		touchIdRef.current = null;
	};
	return {
		state,
		handlers: {
			onTouchStart: handleTouchStart,
			onTouchMove: handleTouchMove,
			onTouchEnd: handleTouchEnd
		}
	};
}
function SwipeableMessage({ canDelete = false, onReply, onDelete, children, className }) {
	const [showActions, setShowActions] = (0, import_react.useState)(false);
	const [pendingAction, setPendingAction] = (0, import_react.useState)(null);
	const containerRef = (0, import_react.useRef)(null);
	const { state, handlers } = useSwipe({
		onSwipeRight: () => {
			if (onReply) {
				setPendingAction("reply");
				setShowActions(true);
			}
		},
		onSwipeLeft: () => {
			if (canDelete && onDelete) {
				setPendingAction("delete");
				setShowActions(true);
			}
		}
	}, { threshold: 60 });
	const handleConfirmAction = () => {
		if (pendingAction === "reply") onReply?.();
		else if (pendingAction === "delete") onDelete?.();
		setShowActions(false);
		setPendingAction(null);
	};
	const handleCancelAction = () => {
		setShowActions(false);
		setPendingAction(null);
	};
	const swipeOffset = state.isSwiping ? state.direction === "right" ? Math.min(state.distance, 80) : state.direction === "left" ? -Math.min(state.distance, 80) : 0 : 0;
	const transformStyle = { transform: showActions ? pendingAction === "reply" ? "translateX(80px)" : "translateX(-80px)" : `translateX(${swipeOffset}px)` };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative overflow-hidden",
		children: [showActions && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("absolute inset-y-0 z-10 flex items-center gap-2 px-4", pendingAction === "reply" ? "left-0 bg-info/10" : "right-0 bg-destructive/10"),
			children: [pendingAction === "reply" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reply, { className: "size-5 text-info" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-medium text-info",
					children: "Reply"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: handleConfirmAction,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: handleCancelAction,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})
			] }), pendingAction === "delete" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-5 text-destructive" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-medium text-destructive",
					children: "Delete"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: handleConfirmAction,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: handleCancelAction,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})
			] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: containerRef,
			className: cn("transition-transform duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)] motion-reduce:transition-none touch-pan-y", state.isSwiping && "transition-none", className),
			style: transformStyle,
			...handlers,
			children
		})]
	});
}
function LongPressMessage({ onLongPress, children, className }) {
	const [isPressed, setIsPressed] = (0, import_react.useState)(false);
	const timeoutRef = (0, import_react.useRef)(null);
	const startPosRef = (0, import_react.useRef)({
		x: 0,
		y: 0
	});
	const handleTouchStart = (e) => {
		if (e.touches.length !== 1) return;
		const touch = e.touches[0];
		if (!touch) return;
		startPosRef.current = {
			x: touch.clientX,
			y: touch.clientY
		};
		setIsPressed(true);
		timeoutRef.current = setTimeout(() => {
			setIsPressed(false);
			onLongPress?.();
		}, 500);
	};
	const handleTouchEnd = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		setIsPressed(false);
	};
	const handleTouchMove = (e) => {
		if (e.touches.length !== 1) return;
		const touch = e.touches[0];
		if (!touch) return;
		const dx = Math.abs(touch.clientX - startPosRef.current.x);
		const dy = Math.abs(touch.clientY - startPosRef.current.y);
		if (dx > 10 || dy > 10) {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
			setIsPressed(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(isPressed && "bg-muted/50 scale-[0.98]", "motion-chromatic", className),
		onTouchStart: handleTouchStart,
		onTouchEnd: handleTouchEnd,
		onTouchMove: handleTouchMove,
		children
	});
}
var CHEVRON_ROTATE_TRANSITION = { duration: .18 };
function ThreadPanelReveal({ open, panelId, children }) {
	if ((0, motion_exports.useReducedMotion)()) return open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		id: panelId,
		className: "mt-3 space-y-2 border-l-2 border-accent/20 pl-4",
		children
	}) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.AnimatePresence, {
		initial: false,
		children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.LazyMotion, {
			features: motion_exports.domAnimation,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.div, {
				id: panelId,
				initial: "hidden",
				animate: "visible",
				exit: "exit",
				variants: fadeInDownVariants,
				className: "mt-3 space-y-2 overflow-hidden border-l-2 border-accent/20 pl-4",
				children
			}, panelId)
		}) : null
	});
}
function ThreadToggleButton({ replyCount, unreadCount = 0, lastReplyLabel, isOpen, isLoading, hasRepliesLoaded, onToggle }) {
	const prefersReducedMotion = (0, motion_exports.useReducedMotion)();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionPressable, {
		className: cn(buttonVariants({
			variant: "ghost",
			size: "sm"
		}), "inline-flex items-center gap-2 text-xs text-primary transition-colors hover:bg-accent/5 hover:text-primary/90", isOpen && "bg-accent/5"),
		onClick: onToggle,
		disabled: isLoading && !isOpen && !hasRepliesLoaded,
		"aria-expanded": isOpen,
		children: [
			isLoading && !isOpen && !hasRepliesLoaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.span, {
				animate: prefersReducedMotion ? void 0 : { rotate: isOpen ? 90 : 0 },
				transition: CHEVRON_ROTATE_TRANSITION,
				className: "inline-flex",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-3.5" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium",
				children: replyCount === 1 ? "1 reply" : `${replyCount} replies`
			}),
			unreadCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary",
				children: [unreadCount, " new"]
			}),
			lastReplyLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-normal text-muted-foreground",
				children: ["· Last reply ", lastReplyLabel]
			})
		]
	});
}
function ThreadError({ error, isLoading, onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "alert",
		"aria-live": "assertive",
		className: "flex items-center justify-between gap-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: error }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			variant: "ghost",
			size: "sm",
			className: "h-6 px-2 text-[11px] text-destructive hover:text-destructive/90",
			onClick: onRetry,
			disabled: isLoading,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("mr-1 size-3", isLoading && "animate-spin") }), "Retry"]
		})]
	});
}
function ThreadLoading({ hasReplies }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"aria-live": "polite",
		"aria-busy": "true",
		className: "flex items-center gap-2 py-1 text-xs text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: hasReplies ? "Loading more replies…" : "Loading replies…" })]
	});
}
function ThreadEmptyState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		icon: MessageSquare,
		title: "No replies yet",
		description: "Be the first to reply in this thread.",
		variant: "inline",
		className: "rounded-md border-dashed bg-muted/10 px-3 py-2 [&_p:last-child]:text-xs"
	});
}
function ThreadLoadMoreButton({ isLoading, onLoadMore }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionPressable, {
		className: cn(buttonVariants({
			variant: "ghost",
			size: "sm"
		}), "inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"),
		onClick: onLoadMore,
		disabled: isLoading,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("size-3.5", isLoading && "animate-spin") }), isLoading ? "Loading…" : "Load older replies"]
	});
}
function ThreadReplyButton({ onReply }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pt-2",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionPressable, {
			className: cn(buttonVariants({
				variant: "outline",
				size: "sm"
			}), "h-9 w-full justify-start text-xs text-muted-foreground hover:text-foreground"),
			onClick: onReply,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reply, { className: "mr-2 size-3.5" }), "Reply to thread…"]
		})
	});
}
function StartThreadButton({ onReply }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionPressable, {
		className: cn(buttonVariants({
			variant: "ghost",
			size: "sm"
		}), "inline-flex items-center gap-2 text-xs text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"),
		onClick: onReply,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reply, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Reply" })]
	});
}
function ThreadRetryButton({ isLoading, onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		variant: "ghost",
		size: "sm",
		className: "h-6 px-2 text-[11px] text-destructive hover:text-destructive/90",
		onClick: onRetry,
		disabled: isLoading,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("mr-1 size-3", isLoading && "animate-spin") }), isLoading ? "Retrying…" : "Retry"]
	});
}
function ThreadSection({ threadRootId, replyCount, unreadCount = 0, lastReplyIso, panel, error, replies, onToggle, onRetry, onLoadMore, onReply, canReply = true, ReplyRenderer }) {
	const { isOpen, isLoading, hasNextCursor } = panel;
	const hasThreadReplies = replyCount > 0;
	const lastReplyLabel = lastReplyIso ? formatRelativeTime(lastReplyIso) : null;
	const hasRepliesLoaded = replies.length > 0;
	const panelId = `thread-panel-${threadRootId}`;
	let threadState = "ready";
	if (error && replies.length === 0) threadState = "error";
	else if (isLoading && replies.length === 0) threadState = "loading";
	else if (!isLoading && replies.length === 0) threadState = "empty";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-2",
		"data-thread-root-id": threadRootId,
		children: [hasThreadReplies ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadToggleButton, {
				replyCount,
				unreadCount,
				lastReplyLabel,
				isOpen,
				isLoading,
				hasRepliesLoaded,
				onToggle
			}), error && !isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadRetryButton, {
				isLoading,
				onRetry
			})]
		}) : canReply ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StartThreadButton, { onReply }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ThreadPanelReveal, {
			open: isOpen,
			panelId,
			children: [
				threadState === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadError, {
					error: error ?? "Unable to load replies.",
					isLoading,
					onRetry
				}) : null,
				threadState === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadLoading, { hasReplies: false }) : null,
				threadState === "empty" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadEmptyState, {}) : null,
				threadState === "ready" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadError, {
					error,
					isLoading,
					onRetry
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: replies.map((reply) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReplyRenderer, { reply }, reply.id))
				})] }) : null,
				isLoading && replies.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadLoading, { hasReplies: true }) : null,
				hasNextCursor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadLoadMoreButton, {
					isLoading,
					onLoadMore
				}) : null,
				canReply ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadReplyButton, { onReply }) : null
			]
		})]
	});
}
function collaborationMessageToUnified(message) {
	return {
		id: message.id,
		senderId: message.senderId ?? null,
		senderName: message.senderName,
		senderRole: message.senderRole,
		content: message.content ?? "",
		createdAtMs: message.createdAt ? Date.parse(message.createdAt) : 0,
		edited: message.isEdited,
		deleted: message.isDeleted,
		reactions: message.reactions,
		attachments: message.attachments?.map((attachment) => ({
			url: attachment.url,
			name: attachment.name,
			mimeType: attachment.type ?? void 0,
			size: attachment.size != null && attachment.size !== "" ? Number(attachment.size) : void 0
		})),
		sharedTo: message.sharedTo,
		mentions: message.mentions,
		threadRootId: message.threadRootId,
		threadReplyCount: message.threadReplyCount,
		threadLastReplyAt: message.threadLastReplyAt,
		isPinned: message.isPinned,
		deletedBy: message.deletedBy,
		deletedAt: message.deletedAt
	};
}
var UnifiedThreadReplyContext = (0, import_react.createContext)(null);
function UnifiedThreadReplyRenderer({ reply }) {
	const context = (0, import_react.use)(UnifiedThreadReplyContext);
	if (!context) throw new Error("UnifiedThreadReplyRenderer requires UnifiedThreadReplyContext");
	const handleToggleReaction = (emoji) => {
		context.handleReaction(reply.id, emoji);
	};
	const handleStartEdit = () => {
		context.handleStartEdit(collaborationMessageToUnified(reply));
	};
	const handleRequestDelete = () => {
		context.handleRequestDelete(reply.id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnifiedThreadReplyCard, {
		reply,
		currentUserId: context.currentUserId,
		editingMessageId: context.editingMessageId,
		activeDeletingMessageId: context.activeDeletingMessageId,
		messageUpdatingId: context.messageUpdatingId,
		reactionPendingEmoji: context.reactionPendingByMessage[reply.id] ?? null,
		onToggleReaction: handleToggleReaction,
		onStartEdit: context.onEditMessage ? handleStartEdit : void 0,
		onRequestDelete: context.onDeleteMessage ? handleRequestDelete : void 0
	});
}
function UnifiedThreadSectionRenderer({ activeDeletingMessageId, expanded, handleLoadMoreThread, handleReaction, handleReply, handleRequestDelete, handleRetryThreadLoad, handleThreadToggle, handleStartEdit, headerType, message, onReply, resolveThreadRootId, threadErrorsByRootId, threadLoadingByRootId, threadMessagesByRootId, threadNextCursorByRootId, threadUnreadCountsByRootId, currentUserId, editingMessageId, messageUpdatingId, onDeleteMessage, onEditMessage, reactionPendingByMessage }) {
	const threadRootId = resolveThreadRootId(message);
	const threadReplies = threadMessagesByRootId[threadRootId] ?? [];
	const threadLoading = threadLoadingByRootId[threadRootId] ?? false;
	const threadError = threadErrorsByRootId[threadRootId] ?? null;
	const threadNextCursor = threadNextCursorByRootId[threadRootId] ?? null;
	const threadReplyCount = message.threadReplyCount;
	const replyCount = Math.max(typeof threadReplyCount === "number" ? threadReplyCount : 0, threadReplies.length);
	const lastReplyIso = message.threadLastReplyAt ?? (threadReplies.length > 0 ? threadReplies[threadReplies.length - 1]?.createdAt ?? null : null);
	const unreadCount = Math.max(0, threadUnreadCountsByRootId[threadRootId] ?? 0);
	const beforeMs = lastReplyIso ? Date.parse(lastReplyIso) : NaN;
	const handleToggle = () => {
		handleThreadToggle(threadRootId, Number.isFinite(beforeMs) ? beforeMs : Date.now());
	};
	const handleRetry = () => {
		handleRetryThreadLoad(threadRootId);
	};
	const handleLoadMore = () => {
		handleLoadMoreThread(threadRootId);
	};
	const handleReplyClick = () => {
		handleReply(message);
	};
	const threadReplyContext = {
		activeDeletingMessageId,
		currentUserId,
		editingMessageId,
		handleReaction,
		handleRequestDelete,
		handleStartEdit,
		messageUpdatingId,
		onDeleteMessage,
		onEditMessage,
		reactionPendingByMessage
	};
	const threadPanel = {
		isOpen: Boolean(expanded[threadRootId]),
		isLoading: threadLoading,
		hasNextCursor: Boolean(threadNextCursor)
	};
	if (headerType !== "channel" || message.deleted) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnifiedThreadReplyContext.Provider, {
		value: threadReplyContext,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadSection, {
			threadRootId,
			replyCount,
			unreadCount,
			lastReplyIso,
			panel: threadPanel,
			error: threadError,
			replies: threadReplies,
			onToggle: handleToggle,
			onRetry: handleRetry,
			onLoadMore: handleLoadMore,
			onReply: handleReplyClick,
			canReply: Boolean(onReply),
			ReplyRenderer: UnifiedThreadReplyRenderer
		})
	});
}
function SwipeableMessageRenderer({ children, currentUserId, handleReply, handleRequestDelete, message, onDeleteMessage, onReply }) {
	const enableSwipeGestures = useMediaQuery("(pointer: coarse)");
	const handleMessageReply = () => {
		handleReply(message);
	};
	const handleMessageDelete = () => {
		handleRequestDelete(message.id);
	};
	if (!enableSwipeGestures) {
		if (!message.deleted && onReply) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LongPressMessage, {
			message,
			onLongPress: handleMessageReply,
			children
		});
		return children;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwipeableMessage, {
		message,
		currentUserId,
		canDelete: !message.deleted && message.senderId === currentUserId && !!onDeleteMessage,
		onReply: !message.deleted && onReply ? handleMessageReply : void 0,
		onDelete: !message.deleted && onDeleteMessage ? handleMessageDelete : void 0,
		children
	}, message.id);
}
function useUnifiedMessagePaneRenderers({ activeDeletingMessageId, channelMessagesById, currentUserId, deletedInfoByMessage, editingMessageId, editingPreview, editingValue, expandedThreadIds, headerType, isMessageSearchActive, messageSearchHighlights, messageUpdatingId, onDeleteMessage, onEditMessage, onReply, onShareToPlatform, onCreateTask, onForwardMessage, onVotePoll, onEndPoll, workspaceId, currentUserRole, dmParticipantName, reactionPendingByMessage, resolveThreadRootId, setEditingValue, sharingTo, threadErrorsByRootId, threadLoadingByRootId, threadMessagesByRootId, threadNextCursorByRootId, threadUnreadCountsByRootId, handleCancelEdit, handleConfirmEdit, handleLoadMoreThread, handleReaction, handleReply, handleRequestDelete, handleRetryThreadLoad, handleShare, handleStartEdit, handleThreadToggle }) {
	const channelMemberNames = (() => {
		if (headerType !== "channel") return null;
		const names = {};
		for (const entry of channelMessagesById.values()) if (entry.senderId && entry.senderName) names[entry.senderId] = entry.senderName;
		return names;
	})();
	const renderMessageExtras = (message) => {
		const platforms = message.sharedTo;
		return platforms && platforms.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SharedPlatformBadges, { platforms }) : null;
	};
	const renderMessageFooter = (message) => {
		const original = channelMessagesById.get(message.id);
		if (!original || original.senderId !== currentUserId || original.isDeleted) return null;
		const memberNames = headerType === "channel" && channelMemberNames ? channelMemberNames : {};
		if (headerType === "dm" && dmParticipantName) {
			for (const readerId of original.readBy ?? []) if (readerId !== currentUserId) memberNames[readerId] = dmParticipantName;
		}
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageDeliveryStatus, {
			message: original,
			currentUserId,
			memberNames,
			className: "mt-1 justify-end"
		});
	};
	const renderMessageActions = (message) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnifiedMessageActionBar, {
		headerType: headerType ?? "dm",
		message,
		currentUserId,
		currentUserRole,
		activeDeletingMessageId,
		messageUpdatingId,
		sharingTo,
		onReply: onReply ? handleReply : void 0,
		onStartEdit: onEditMessage ? handleStartEdit : void 0,
		onRequestDelete: onDeleteMessage ? handleRequestDelete : void 0,
		onShare: onShareToPlatform ? handleShare : void 0,
		onCreateTask,
		onForward: onForwardMessage,
		pinWorkspaceId: workspaceId,
		pinMessage: channelMessagesById.get(message.id)
	});
	const renderMessageContent = function PaneMessageContent({ message }) {
		return renderMessageContentBlock({
			message,
			originalMessage: channelMessagesById.get(message.id),
			highlightTerms: isMessageSearchActive ? messageSearchHighlights : void 0,
			currentUserId,
			isAdmin: currentUserRole === "admin",
			onVotePoll,
			onEndPoll
		});
	};
	const renderMessageAttachments = (message) => renderMessageAttachmentsContent(message);
	const renderDeletedInfo = (message) => renderDeletedMessageInfo(message, deletedInfoByMessage);
	const renderEditForm = (message) => renderMessageEditForm(message, editingMessageId, editingValue, setEditingValue, handleConfirmEdit, handleCancelEdit, messageUpdatingId === message.id, editingPreview);
	const renderThreadSection = (message) => {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnifiedThreadSectionRenderer, {
			activeDeletingMessageId,
			currentUserId,
			editingMessageId,
			expanded: expandedThreadIds,
			handleLoadMoreThread,
			handleReaction,
			handleReply,
			handleRequestDelete,
			handleRetryThreadLoad,
			handleStartEdit,
			handleThreadToggle,
			headerType,
			message,
			onReply,
			onDeleteMessage,
			onEditMessage,
			reactionPendingByMessage,
			resolveThreadRootId,
			threadErrorsByRootId,
			threadLoadingByRootId,
			threadMessagesByRootId,
			threadNextCursorByRootId,
			threadUnreadCountsByRootId,
			messageUpdatingId
		});
	};
	const renderMessageWrapper = (message, children) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwipeableMessageRenderer, {
		currentUserId,
		handleReply,
		handleRequestDelete,
		message,
		onDeleteMessage,
		onReply,
		children
	});
	return {
		renderDeletedInfo,
		renderEditForm,
		renderMessageActions,
		renderMessageAttachments,
		renderMessageContent,
		renderMessageExtras,
		renderMessageFooter,
		renderMessageWrapper,
		renderThreadSection: headerType === "channel" ? renderThreadSection : void 0
	};
}
function useUnifiedMessagePaneController({ channelMessages, focusMessageId = null, focusThreadId = null, header, isSending, messageDeletingId = null, messageInput, messageUpdatingId = null, onAddAttachments, onComposerBlur, onComposerFocus, onDeleteMessage, onEditMessage, onLoadMoreThreadReplies, onLoadThreadReplies, onMarkThreadAsRead, onReply, onSendMessage, onShareToPlatform, onToggleReaction, pendingAttachments, threadErrorsByRootId, threadLoadingByRootId, threadMessagesByRootId, uploadingAttachments }) {
	const [sharingTo, setSharingTo] = (0, import_react.useState)(null);
	const [paneUi, setPaneUi] = (0, import_react.useState)({
		deletingMessageId: null,
		confirmingDeleteMessageId: null,
		editingMessageId: null,
		editingValue: "",
		editingPreview: "",
		isComposerFocused: false
	});
	const { deletingMessageId, confirmingDeleteMessageId, editingMessageId, editingValue, editingPreview, isComposerFocused } = paneUi;
	const [expandedThreadIds, setExpandedThreadIds] = (0, import_react.useState)({});
	const fileInputRef = (0, import_react.useRef)(null);
	const lastAutoOpenedThreadRef = (0, import_react.useRef)(null);
	const lastConversationKeyRef = (0, import_react.useRef)(null);
	const activeDeletingMessageId = deletingMessageId ?? messageDeletingId;
	const conversationKey = header?.conversationKey ?? (header ? `${header.type}:${header.name}` : "none");
	const hasPendingAttachments = pendingAttachments.length > 0;
	const channelMessagesById = (() => {
		const map = /* @__PURE__ */ new Map();
		for (const message of channelMessages ?? []) if (message?.id) map.set(message.id, message);
		for (const replies of Object.values(threadMessagesByRootId)) for (const reply of replies) if (reply?.id) map.set(reply.id, reply);
		return map;
	})();
	const effectiveFocusMessageId = (() => {
		if (typeof focusMessageId !== "string") return null;
		const normalizedId = focusMessageId.trim();
		if (!normalizedId) return null;
		const focusedMessage = channelMessagesById.get(normalizedId);
		if (!focusedMessage?.parentMessageId) return normalizedId;
		return focusedMessage.threadRootId?.trim() || focusedMessage.parentMessageId?.trim() || normalizedId;
	})();
	const effectiveFocusThreadId = (() => {
		if (typeof focusThreadId === "string" && focusThreadId.trim().length > 0) return focusThreadId.trim();
		if (typeof focusMessageId !== "string" || focusMessageId.trim().length === 0) return null;
		const focusedMessage = channelMessagesById.get(focusMessageId.trim());
		if (!focusedMessage) return null;
		return focusedMessage.threadRootId?.trim() || focusedMessage.parentMessageId?.trim() || null;
	})();
	(0, import_react.useEffect)(() => {
		if (lastConversationKeyRef.current === conversationKey) return;
		lastConversationKeyRef.current = conversationKey;
		const frame = window.requestAnimationFrame(() => {
			setExpandedThreadIds({});
			setPaneUi({
				deletingMessageId: null,
				confirmingDeleteMessageId: null,
				editingMessageId: null,
				editingValue: "",
				editingPreview: "",
				isComposerFocused: false
			});
		});
		return () => window.cancelAnimationFrame(frame);
	}, [conversationKey]);
	const handleReaction = async (messageId, emoji) => {
		await onToggleReaction(messageId, emoji);
	};
	const handleReply = (message) => {
		onReply?.(message);
	};
	const handleDelete = async (messageId) => {
		if (!onDeleteMessage) return;
		setPaneUi((prev) => ({
			...prev,
			deletingMessageId: messageId
		}));
		try {
			await onDeleteMessage(messageId);
		} finally {
			setPaneUi((prev) => ({
				...prev,
				deletingMessageId: null
			}));
		}
	};
	const handleRequestDelete = (messageId) => {
		setPaneUi((prev) => ({
			...prev,
			confirmingDeleteMessageId: messageId
		}));
	};
	const handleCancelDelete = () => {
		if (activeDeletingMessageId) return;
		setPaneUi((prev) => ({
			...prev,
			confirmingDeleteMessageId: null
		}));
	};
	const handleConfirmDelete = async () => {
		if (!confirmingDeleteMessageId) return;
		try {
			await handleDelete(confirmingDeleteMessageId);
			setPaneUi((prev) => ({
				...prev,
				confirmingDeleteMessageId: null
			}));
		} catch (error) {
			logError(error, "useUnifiedMessagePaneController:handleConfirmDelete");
		}
	};
	const handleStartEdit = (message) => {
		if (!onEditMessage || message.deleted) return;
		setPaneUi((prev) => ({
			...prev,
			editingMessageId: message.id,
			editingValue: message.content ?? "",
			editingPreview: (message.content ?? "").trim().slice(0, 120)
		}));
	};
	const handleCancelEdit = () => {
		if (messageUpdatingId) return;
		setPaneUi((prev) => ({
			...prev,
			editingMessageId: null,
			editingValue: "",
			editingPreview: ""
		}));
	};
	const handleConfirmEdit = async () => {
		if (!onEditMessage || !editingMessageId) return;
		const trimmedValue = editingValue.trim();
		if (!trimmedValue) {
			notifyFailure({
				title: "Message required",
				message: "Enter a message before saving your changes."
			});
			return;
		}
		try {
			await onEditMessage(editingMessageId, trimmedValue);
			setPaneUi((prev) => ({
				...prev,
				editingMessageId: null,
				editingValue: "",
				editingPreview: ""
			}));
		} catch (error) {
			logError(error, "useUnifiedMessagePaneController:handleSaveEdit");
		}
	};
	const handleShare = async (message, platform) => {
		if (!onShareToPlatform) return;
		setSharingTo(`${message.id}-${platform}`);
		await onShareToPlatform(message, platform).then(() => {
			notifySuccess({
				title: "Message shared",
				message: `Sent to ${platform === "email" ? "Email" : platform}`
			});
		}).catch(() => {
			notifyFailure({
				title: "Share failed",
				message: "Share failed"
			});
		});
		setSharingTo(null);
	};
	const handleSend = async () => {
		if (!messageInput.trim() && !hasPendingAttachments || isSending || uploadingAttachments) return;
		await onSendMessage();
	};
	const handleComposerFocusInternal = () => {
		setPaneUi((prev) => ({
			...prev,
			isComposerFocused: true
		}));
		onComposerFocus?.();
	};
	const handleComposerBlurInternal = () => {
		setPaneUi((prev) => ({
			...prev,
			isComposerFocused: false
		}));
		onComposerBlur?.();
	};
	const handleAttachmentInputChange = (event) => {
		if (!onAddAttachments) return;
		const files = event.target.files;
		if (files && files.length > 0) onAddAttachments(files);
		event.target.value = "";
	};
	const handleComposerDragOver = (event) => {
		if (!onAddAttachments) return;
		event.preventDefault();
		event.dataTransfer.dropEffect = "copy";
	};
	const handleComposerDrop = (event) => {
		if (!onAddAttachments) return;
		event.preventDefault();
		const files = event.dataTransfer.files;
		if (files && files.length > 0) onAddAttachments(files);
	};
	const handleComposerPaste = (event) => {
		if (!onAddAttachments) return;
		const files = Array.from(event.clipboardData?.files ?? []).filter((file) => file.type.startsWith("image/"));
		if (files.length > 0) {
			event.preventDefault();
			onAddAttachments(files);
		}
	};
	const resolveThreadRootId = (message) => {
		const original = channelMessagesById.get(message.id);
		if (original?.threadRootId && original.threadRootId.trim().length > 0) return original.threadRootId.trim();
		if (message.threadRootId && message.threadRootId.trim().length > 0) return message.threadRootId.trim();
		return message.id;
	};
	const handleThreadToggle = (threadRootId, beforeMs) => {
		const normalizedId = typeof threadRootId === "string" ? threadRootId.trim() : "";
		if (!normalizedId) return;
		const isCurrentlyOpen = Boolean(expandedThreadIds[normalizedId]);
		setExpandedThreadIds((prev) => {
			const next = { ...prev };
			if (isCurrentlyOpen) delete next[normalizedId];
			else next[normalizedId] = true;
			return next;
		});
		if (!isCurrentlyOpen) {
			const hasRepliesLoaded = (threadMessagesByRootId[normalizedId]?.length ?? 0) > 0;
			const hasError = Boolean(threadErrorsByRootId[normalizedId]);
			const isLoadingReplies = Boolean(threadLoadingByRootId[normalizedId]);
			if ((!hasRepliesLoaded || hasError) && !isLoadingReplies) onLoadThreadReplies?.(normalizedId);
			onMarkThreadAsRead?.(normalizedId, beforeMs);
		}
	};
	const handleRetryThreadLoad = (threadRootId) => {
		const normalizedId = typeof threadRootId === "string" ? threadRootId.trim() : "";
		if (!normalizedId) return;
		onLoadThreadReplies?.(normalizedId);
	};
	const handleLoadMoreThread = (threadRootId) => {
		const normalizedId = typeof threadRootId === "string" ? threadRootId.trim() : "";
		if (!normalizedId) return;
		onLoadMoreThreadReplies?.(normalizedId);
	};
	(0, import_react.useEffect)(() => {
		if (!effectiveFocusThreadId) {
			lastAutoOpenedThreadRef.current = null;
			return;
		}
		if (lastAutoOpenedThreadRef.current === effectiveFocusThreadId) return;
		lastAutoOpenedThreadRef.current = effectiveFocusThreadId;
		const frame = window.requestAnimationFrame(() => {
			setExpandedThreadIds((prev) => {
				if (prev[effectiveFocusThreadId]) return prev;
				return {
					...prev,
					[effectiveFocusThreadId]: true
				};
			});
		});
		const hasRepliesLoaded = (threadMessagesByRootId[effectiveFocusThreadId]?.length ?? 0) > 0;
		const isLoadingReplies = Boolean(threadLoadingByRootId[effectiveFocusThreadId]);
		if (!hasRepliesLoaded && !isLoadingReplies) onLoadThreadReplies?.(effectiveFocusThreadId);
		onMarkThreadAsRead?.(effectiveFocusThreadId);
		return () => window.cancelAnimationFrame(frame);
	}, [
		effectiveFocusThreadId,
		onLoadThreadReplies,
		onMarkThreadAsRead,
		threadLoadingByRootId,
		threadMessagesByRootId
	]);
	return {
		activeDeletingMessageId,
		channelMessagesById,
		confirmingDeleteMessageId,
		editingMessageId,
		editingPreview,
		editingValue,
		effectiveFocusMessageId,
		effectiveFocusThreadId,
		expandedThreadIds,
		fileInputRef,
		handleAttachmentInputChange,
		handleCancelDelete,
		handleCancelEdit,
		handleComposerBlurInternal,
		handleComposerDragOver,
		handleComposerDrop,
		handleComposerFocusInternal,
		handleComposerPaste,
		handleConfirmDelete,
		handleConfirmEdit,
		handleDelete,
		handleLoadMoreThread,
		handleReaction,
		handleReply,
		handleRequestDelete,
		handleRetryThreadLoad,
		handleSend,
		handleShare,
		handleStartEdit,
		handleThreadToggle,
		hasPendingAttachments,
		isComposerFocused,
		setEditingValue: (value) => setPaneUi((prev) => ({
			...prev,
			editingValue: value
		})),
		sharingTo,
		resolveThreadRootId
	};
}
var EMPTY_PENDING_ATTACHMENTS = [];
var EMPTY_MESSAGE_SEARCH_HIGHLIGHTS = [];
var EMPTY_REACTION_PENDING_BY_MESSAGE = {};
var EMPTY_PARTICIPANTS = [];
var EMPTY_THREAD_MESSAGES_BY_ROOT_ID = {};
var EMPTY_THREAD_NEXT_CURSOR_BY_ROOT_ID = {};
var EMPTY_THREAD_LOADING_BY_ROOT_ID = {};
var EMPTY_THREAD_ERRORS_BY_ROOT_ID = {};
var EMPTY_THREAD_UNREAD_COUNTS_BY_ROOT_ID = {};
function UnifiedMessagePane({ header, messages, currentUserId, currentUserRole, listState, composerState, onLoadMore, onRefresh, messageSearchQuery = "", onMessageSearchChange, messageSearchHighlights = EMPTY_MESSAGE_SEARCH_HIGHLIGHTS, messageInput, onMessageInputChange, onSendMessage, replyingToMessage = null, onCancelReply, pendingAttachments = EMPTY_PENDING_ATTACHMENTS, onAddAttachments, onRemoveAttachment, onToggleReaction, reactionPendingByMessage = EMPTY_REACTION_PENDING_BY_MESSAGE, onReply, onDeleteMessage, onEditMessage, onShareToPlatform, onCreateTask, onForwardMessage, onCreatePoll, workspaceId, dmParticipantName, typingIndicator, onComposerFocus, onComposerBlur, emptyState, statusBanner, placeholder = "Type a message...", participants = EMPTY_PARTICIPANTS, channelMessages, deletedInfoByMessage, threadMessagesByRootId = EMPTY_THREAD_MESSAGES_BY_ROOT_ID, threadNextCursorByRootId = EMPTY_THREAD_NEXT_CURSOR_BY_ROOT_ID, threadLoadingByRootId = EMPTY_THREAD_LOADING_BY_ROOT_ID, threadErrorsByRootId = EMPTY_THREAD_ERRORS_BY_ROOT_ID, threadUnreadCountsByRootId = EMPTY_THREAD_UNREAD_COUNTS_BY_ROOT_ID, onLoadThreadReplies, onLoadMoreThreadReplies, onMarkThreadAsRead, focusMessageId = null, focusThreadId = null, messageUpdatingId = null, messageDeletingId = null }) {
	const { loading: isLoading, loadingMore: isLoadingMore, hasMore } = listState;
	const { sending: isSending, uploadingAttachments = false, pendingAttachments: hasPendingAttachmentsFromProps = false } = composerState;
	const { activeDeletingMessageId, channelMessagesById, confirmingDeleteMessageId, editingMessageId, editingPreview, editingValue, effectiveFocusMessageId, effectiveFocusThreadId, expandedThreadIds, fileInputRef, handleAttachmentInputChange, handleCancelDelete, handleCancelEdit, handleComposerBlurInternal, handleComposerDragOver, handleComposerDrop, handleComposerFocusInternal, handleComposerPaste, handleConfirmDelete, handleConfirmEdit, handleLoadMoreThread, handleReaction, handleReply, handleRequestDelete, handleRetryThreadLoad, handleSend, handleShare, handleStartEdit, handleThreadToggle, hasPendingAttachments, isComposerFocused, setEditingValue, sharingTo, resolveThreadRootId } = useUnifiedMessagePaneController({
		header,
		channelMessages,
		threadMessagesByRootId,
		threadLoadingByRootId,
		threadErrorsByRootId,
		focusMessageId,
		focusThreadId,
		onToggleReaction,
		onReply,
		onDeleteMessage,
		onEditMessage,
		onShareToPlatform,
		messageInput,
		onSendMessage,
		isSending,
		uploadingAttachments,
		onComposerFocus,
		onComposerBlur,
		onAddAttachments,
		onLoadThreadReplies,
		onMarkThreadAsRead,
		onLoadMoreThreadReplies,
		pendingAttachments,
		messageDeletingId,
		messageUpdatingId
	});
	const canSearchMessages = Boolean(onMessageSearchChange);
	const isMessageSearchActive = messageSearchQuery.trim().length > 0;
	const searchState = {
		canSearch: canSearchMessages,
		active: isMessageSearchActive
	};
	const layoutComposerState = {
		focused: isComposerFocused,
		sending: isSending,
		pendingAttachments: hasPendingAttachments,
		uploadingAttachments
	};
	const pollActions = usePollMessageActions({
		workspaceId: workspaceId ?? null,
		mode: header?.type === "dm" ? "dm" : "channel"
	});
	const messageListRenderers = useUnifiedMessagePaneRenderers({
		activeDeletingMessageId,
		channelMessagesById,
		currentUserId,
		deletedInfoByMessage,
		editingMessageId,
		editingPreview,
		editingValue,
		expandedThreadIds,
		headerType: header?.type,
		isMessageSearchActive,
		messageSearchHighlights,
		messageUpdatingId,
		onDeleteMessage,
		onEditMessage,
		onReply,
		onShareToPlatform,
		onCreateTask,
		onForwardMessage,
		onVotePoll: pollActions.handleVote,
		onEndPoll: pollActions.handleEndPoll,
		workspaceId,
		currentUserRole,
		dmParticipantName,
		reactionPendingByMessage,
		resolveThreadRootId,
		setEditingValue,
		sharingTo,
		threadErrorsByRootId,
		threadLoadingByRootId,
		threadMessagesByRootId,
		threadNextCursorByRootId,
		threadUnreadCountsByRootId,
		handleCancelEdit,
		handleConfirmEdit,
		handleLoadMoreThread,
		handleReaction,
		handleReply,
		handleRequestDelete,
		handleRetryThreadLoad,
		handleShare,
		handleStartEdit,
		handleThreadToggle
	});
	if (!header) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnifiedMessagePaneEmptyState, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnifiedMessagePaneConversationLayout, {
		activeDeletingMessageId,
		searchState,
		confirmingDeleteMessageId,
		currentUserId,
		currentUserRole,
		editingMessageId,
		effectiveFocusMessageId,
		effectiveFocusThreadId,
		emptyState,
		fileInputRef,
		handleAttachmentInputChange,
		handleCancelDelete,
		handleComposerBlurInternal,
		handleComposerDragOver,
		handleComposerDrop,
		handleComposerFocusInternal,
		handleComposerPaste,
		handleConfirmDelete,
		handleReaction,
		handleSend,
		listState,
		composerState: layoutComposerState,
		header,
		messageInput,
		messageListRenderers,
		messageSearchQuery,
		messageUpdatingId,
		messages,
		onAddAttachments,
		onDeleteMessage,
		onLoadMore,
		onMessageInputChange,
		onMessageSearchChange,
		onRefresh,
		onRemoveAttachment,
		onReply,
		replyingToMessage,
		onCancelReply,
		participants,
		pendingAttachments,
		uploadingAttachments,
		placeholder,
		reactionPendingByMessage,
		statusBanner,
		typingIndicator,
		onCreatePoll,
		workspaceId
	});
}
function hasRequestedDeepLinkTarget(channelMessages, threadMessagesByRootId, deepLinkMessageId, deepLinkThreadId) {
	const normalizedMessageId = typeof deepLinkMessageId === "string" ? deepLinkMessageId.trim() : "";
	const normalizedThreadId = typeof deepLinkThreadId === "string" ? deepLinkThreadId.trim() : "";
	if (!normalizedMessageId && !normalizedThreadId) return false;
	return [...channelMessages, ...Object.values(threadMessagesByRootId).flat()].some((message) => {
		if (normalizedMessageId && message.id === normalizedMessageId) return true;
		if (!normalizedThreadId) return false;
		return (typeof message.threadRootId === "string" && message.threadRootId.trim().length > 0 ? message.threadRootId.trim() : message.id) === normalizedThreadId || message.parentMessageId === normalizedThreadId || message.id === normalizedThreadId;
	});
}
function ChannelConversationPane(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelConversationPaneInner, { ...props }, props.selectedChannel.id);
}
function ChannelConversationPaneInner({ listState, searchState, composerState, channelMessages, channelMessagesForPane, channelParticipants, mentionParticipants, currentUserId, currentUserRole, deepLinkMessageId, deepLinkThreadId, messageDeletingId, messageInput, messageSearchQuery, messageUpdatingId, onAddAttachments, onBackToInbox, onClearDeepLink, onComposerBlur, onComposerFocus, onDeleteMessage, onEditMessage, onLoadMore, onLoadMoreThreadReplies, onLoadThreadReplies, onMarkThreadAsRead, onMessageInputChange, onMessageSearchChange, onRemoveAttachment, onSendMessage, onShareToPlatform, onCreateTask, onForwardMessage, onCreatePoll, onExportChannel, onOpenChannelMessage, onToggleReaction, pendingAttachments, reactionPendingByMessage, searchHighlights, selectedChannel, sharedFiles, canManageMembers, onManageMembers, workspaceId, isAdmin, threadErrorsByRootId, threadLoadingByRootId, threadMessagesByRootId, threadNextCursorByRootId, threadUnreadCountsByRootId, typingIndicatorText, messagesError, onRetryMessages, channelUnreadCount, onMarkChannelRead, markChannelReadPending }) {
	const { canLoadMore, loading: isCurrentChannelLoading, loadingMore } = listState;
	const { active: isChannelSearchActive, searching: searchingMessages } = searchState;
	const { sending, uploading } = composerState;
	const [replyingToMessage, setReplyingToMessage] = (0, import_react.useState)(null);
	const threadMessagesById = (() => {
		const byId = /* @__PURE__ */ new Map();
		for (const replies of Object.values(threadMessagesByRootId)) for (const entry of replies) byId.set(entry.id, entry);
		return byId;
	})();
	const resolveCollaborationMessage = (message) => {
		const fromChannel = channelMessages.find((entry) => entry.id === message.id);
		if (fromChannel) return fromChannel;
		return threadMessagesById.get(message.id) ?? null;
	};
	const handleReply = (message) => {
		setReplyingToMessage(resolveCollaborationMessage(message));
	};
	const handleCancelReply = () => {
		setReplyingToMessage(null);
	};
	const handleCreatePoll = async (poll) => {
		await onCreatePoll?.(poll);
	};
	const channelEmptyState = (() => {
		if (isCurrentChannelLoading || searchingMessages) return;
		if (channelMessages.length > 0) return;
		if (isChannelSearchActive) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoSearchResultsState, {});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyMessagesState, {});
	})();
	const showMissingDeepLinkNotice = (Boolean(deepLinkMessageId?.trim()) || Boolean(deepLinkThreadId?.trim())) && !isCurrentChannelLoading && !searchingMessages && !hasRequestedDeepLinkTarget(channelMessages, threadMessagesByRootId, deepLinkMessageId, deepLinkThreadId);
	const channelHeader = {
		conversationKey: selectedChannel.id,
		name: selectedChannel.name,
		type: "channel",
		channelKind: selectedChannel.type,
		participantCount: channelParticipants.length,
		messageCount: channelMessages.length,
		onExport: onExportChannel,
		buildShareableUrl: () => buildCollaborationChannelShareUrl(selectedChannel),
		channelUnreadCount,
		onMarkChannelRead,
		markChannelReadPending,
		onBack: onBackToInbox,
		channelInfo: workspaceId != null ? {
			channel: selectedChannel,
			channelMessages,
			channelParticipants,
			currentUserId,
			onPinnedMessageClick: onOpenChannelMessage ? (messageId) => {
				onOpenChannelMessage(messageId);
			} : void 0,
			sharedFiles,
			workspaceId,
			isAdmin,
			canManageMembers,
			onManageMembers
		} : void 0
	};
	const missingDeepLinkBanner = (() => {
		if (!showMissingDeepLinkNotice) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
			className: "mx-4 mt-4 border-warning/20 bg-warning/10 text-warning-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Linked message unavailable" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"We couldn't open the requested message in #",
						selectedChannel.name,
						". It may no longer be available in this channel."
					] }), onClearDeepLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: onClearDeepLink,
						children: "Clear link"
					}) : null]
				})
			]
		});
	})();
	const combinedStatusBanner = (() => {
		const errorBanner = messagesError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-4 mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessagesErrorState, {
				error: messagesError,
				onRetry: onRetryMessages,
				isRetrying: searchingMessages && isChannelSearchActive
			})
		}) : null;
		if (!missingDeepLinkBanner && !errorBanner) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [missingDeepLinkBanner, errorBanner] });
	})();
	const handleLoadMore = () => {
		onLoadMore(selectedChannel.id);
	};
	const handleSendMessage = async () => {
		await onSendMessage({ parentMessageId: replyingToMessage?.id });
		setReplyingToMessage(null);
	};
	const handleToggleReaction = async (messageId, emoji) => {
		await onToggleReaction(selectedChannel.id, messageId, emoji);
	};
	const handleDeleteMessage = async (messageId) => {
		await onDeleteMessage(selectedChannel.id, messageId);
	};
	const handleEditMessage = async (messageId, newContent) => {
		await onEditMessage(selectedChannel.id, messageId, newContent);
	};
	const channelListState = {
		loading: isCurrentChannelLoading || isChannelSearchActive && searchingMessages,
		loadingMore: !isChannelSearchActive && loadingMore,
		hasMore: !isChannelSearchActive && canLoadMore
	};
	const channelComposerState = {
		sending: sending || uploading,
		pendingAttachments: pendingAttachments.length > 0,
		uploadingAttachments: uploading
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnifiedMessagePane, {
		header: channelHeader,
		messages: channelMessagesForPane.map(collaborationToUnifiedMessage),
		currentUserId,
		currentUserRole,
		listState: channelListState,
		onLoadMore: handleLoadMore,
		messageSearchQuery,
		onMessageSearchChange,
		messageSearchHighlights: searchHighlights,
		messageInput,
		onMessageInputChange,
		onSendMessage: handleSendMessage,
		onReply: handleReply,
		replyingToMessage,
		onCancelReply: handleCancelReply,
		emptyState: channelEmptyState,
		composerState: channelComposerState,
		pendingAttachments,
		onAddAttachments,
		onRemoveAttachment,
		typingIndicator: typingIndicatorText,
		onComposerFocus,
		onComposerBlur,
		onToggleReaction: handleToggleReaction,
		onShareToPlatform,
		onCreateTask,
		onForwardMessage,
		onCreatePoll: onCreatePoll ? handleCreatePoll : void 0,
		workspaceId,
		reactionPendingByMessage,
		onDeleteMessage: handleDeleteMessage,
		onEditMessage: handleEditMessage,
		participants: mentionParticipants,
		statusBanner: combinedStatusBanner,
		channelMessages,
		threadMessagesByRootId,
		threadNextCursorByRootId,
		threadLoadingByRootId,
		threadErrorsByRootId,
		threadUnreadCountsByRootId,
		onLoadThreadReplies,
		onLoadMoreThreadReplies,
		onMarkThreadAsRead,
		focusMessageId: deepLinkMessageId,
		focusThreadId: deepLinkThreadId,
		messageUpdatingId,
		messageDeletingId
	});
}
function directMessageToCollaborationMessage(message) {
	return {
		id: message.legacyId,
		channelType: "team",
		clientId: null,
		projectId: null,
		content: message.content,
		senderId: message.senderId,
		senderName: message.senderName,
		senderRole: message.senderRole ?? null,
		createdAt: new Date(message.createdAtMs).toISOString(),
		updatedAt: message.editedAtMs ? new Date(message.editedAtMs).toISOString() : null,
		isEdited: Boolean(message.edited),
		deletedAt: message.deletedAtMs ? new Date(message.deletedAtMs).toISOString() : null,
		deletedBy: message.deletedBy ?? null,
		isDeleted: Boolean(message.deleted),
		attachments: message.attachments?.map((attachment) => ({
			name: attachment.name,
			url: attachment.url,
			storageId: attachment.storageId ?? void 0,
			type: attachment.type ?? null,
			size: attachment.size ?? null
		})),
		reactions: message.reactions ?? void 0,
		readBy: message.readBy ?? [],
		deliveredTo: message.deliveredTo ?? []
	};
}
function directMessageToUnifiedMessage(message) {
	return {
		id: message.legacyId,
		senderId: message.senderId,
		senderName: message.senderName,
		senderRole: message.senderRole,
		content: message.content,
		createdAtMs: message.createdAtMs,
		edited: message.edited,
		deleted: message.deleted,
		deletedBy: message.deletedBy ?? void 0,
		deletedAt: typeof message.deletedAtMs === "number" ? new Date(message.deletedAtMs).toISOString() : void 0,
		reactions: message.reactions ?? void 0,
		attachments: message.attachments?.map((attachment) => ({
			url: attachment.url,
			name: attachment.name,
			mimeType: attachment.type ?? void 0,
			size: attachment.size ? parseInt(attachment.size, 10) : void 0
		})) ?? void 0,
		sharedTo: message.sharedTo ?? void 0,
		readBy: message.readBy ?? void 0,
		deliveredTo: message.deliveredTo ?? void 0
	};
}
function DirectMessageConversationPane({ mentionParticipants, currentUserId, dmDeleteMessage, dmEditMessage, dmHasMoreMessages, dmIsLoadingMessages, dmIsLoadingMore, dmIsSending, dmLoadMoreMessages, dmMessageInput, dmMessageSearchQuery, dmMessagesForPane, dmMuteConversation, dmSearchHighlights, dmSearchingMessages, dmToggleReaction, handleSendDirectMessage, isDmSearchActive, onAddAttachments, onArchiveConversation, onBackToInbox, onDmMessageSearchChange, onRemoveAttachment, pendingAttachments, selectedDM, setActiveDmMessageInput, uploading, onStartNewDM, messagesError, onRetryMessages, onShareToPlatform, onComposerFocus, onComposerBlur, typingIndicatorText, onCreateTask, currentUserRole, workspaceId, deepLinkMessageId, onClearDeepLink }) {
	const handleDmSend = async () => {
		const content = dmMessageInput.trim();
		if (!content && pendingAttachments.length === 0) return;
		await handleSendDirectMessage(content);
	};
	const dmEmptyState = (() => {
		if (dmIsLoadingMessages || dmSearchingMessages) return;
		if (dmMessagesForPane.length > 0) return;
		if (isDmSearchActive) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoSearchResultsState, {});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyMessagesState, {});
	})();
	const dmHeader = {
		conversationKey: selectedDM.legacyId,
		name: selectedDM.otherParticipantName,
		type: "dm",
		role: selectedDM.otherParticipantRole,
		isArchived: selectedDM.isArchived,
		isMuted: selectedDM.isMuted,
		onArchive: onArchiveConversation,
		onMute: dmMuteConversation,
		primaryActionLabel: "New chat",
		onPrimaryAction: onStartNewDM,
		buildShareableUrl: () => buildCollaborationDmShareUrl(selectedDM.legacyId),
		onBack: onBackToInbox
	};
	const dmStatusBanner = (() => {
		if (!messagesError) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-4 mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessagesErrorState, {
				error: messagesError,
				onRetry: onRetryMessages,
				isRetrying: dmSearchingMessages && isDmSearchActive
			})
		});
	})();
	const dmListState = {
		loading: dmIsLoadingMessages || isDmSearchActive && dmSearchingMessages,
		loadingMore: !isDmSearchActive && dmIsLoadingMore,
		hasMore: !isDmSearchActive && dmHasMoreMessages
	};
	const dmComposerState = {
		sending: dmIsSending || uploading,
		pendingAttachments: pendingAttachments.length > 0,
		uploadingAttachments: uploading
	};
	const dmChannelMessages = dmMessagesForPane.map(directMessageToCollaborationMessage);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnifiedMessagePane, {
		header: dmHeader,
		messages: dmMessagesForPane.map(directMessageToUnifiedMessage),
		channelMessages: dmChannelMessages,
		currentUserId,
		currentUserRole,
		workspaceId,
		dmParticipantName: selectedDM.otherParticipantName,
		focusMessageId: deepLinkMessageId,
		onCreateTask,
		listState: dmListState,
		onLoadMore: dmLoadMoreMessages,
		messageSearchQuery: dmMessageSearchQuery,
		onMessageSearchChange: onDmMessageSearchChange,
		messageSearchHighlights: dmSearchHighlights,
		messageInput: dmMessageInput,
		onMessageInputChange: setActiveDmMessageInput,
		onSendMessage: handleDmSend,
		emptyState: dmEmptyState,
		participants: mentionParticipants,
		composerState: dmComposerState,
		pendingAttachments,
		onAddAttachments,
		onRemoveAttachment,
		onToggleReaction: dmToggleReaction,
		onDeleteMessage: dmDeleteMessage,
		onEditMessage: dmEditMessage,
		onShareToPlatform,
		onComposerFocus,
		onComposerBlur,
		typingIndicator: typingIndicatorText,
		placeholder: `Message ${selectedDM.otherParticipantName}...`,
		statusBanner: dmStatusBanner
	});
}
function EmptyConversationPane({ channelCount, dmCount, onNewDM }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-[min(60dvh,480px)] flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-muted/20 via-background to-background px-4 py-10 sm:px-6 sm:py-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-accent/10 text-primary ring-1 ring-primary/15",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-8" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "Pick a conversation"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted-foreground",
					children: "Choose a channel or direct message in the inbox to read the thread, react, and reply in context."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						className: "gap-1.5 border-muted/60 bg-background/80",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, { className: "size-3" }),
							channelCount,
							" channel",
							channelCount === 1 ? "" : "s"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						className: "gap-1.5 border-muted/60 bg-background/80",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-3" }),
							dmCount,
							" DM",
							dmCount === 1 ? "" : "s"
						]
					})]
				}),
				onNewDM ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					className: "mt-8 gap-2 shadow-sm",
					onClick: onNewDM,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Start a direct message"]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-[11px] text-muted-foreground/80",
					children: [
						"Tip: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "rounded border border-muted/60 bg-muted/50 px-1 py-0.5 font-mono text-[10px]",
							children: "⌘/Ctrl"
						}),
						" ",
						"+ ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "rounded border border-muted/60 bg-muted/50 px-1 py-0.5 font-mono text-[10px]",
							children: "K"
						}),
						" focuses inbox search."
					]
				})
			]
		})]
	});
}
function useUnifiedInboxController({ sidebar, channelPane, directMessagePane, onBackToInbox }) {
	const { channels, channelSummaries, channelUnreadCounts, dmConversations, selectedChannel, selectedDM, onSelectChannel, onSelectDM, isLoadingChannels, isLoadingDMs } = sidebar;
	const { channelMessages, visibleMessages, messageSearchQuery, typingParticipants } = channelPane;
	const { messages: dmMessages, visibleMessages: dmVisibleMessages, messageSearchQuery: dmMessageSearchQuery, sendMessage: dmSendMessage, pendingAttachments, uploadPendingAttachments, clearPendingAttachments, typingParticipants: dmTypingParticipants, notifyDmTyping } = directMessagePane;
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [sourceFilter, setSourceFilter] = (0, import_react.useState)("all");
	const [dmMessageInputByConversation, setDmMessageInputByConversation] = (0, import_react.useState)({});
	const activeDmLegacyId = selectedDM?.legacyId ?? null;
	const dmMessageInput = activeDmLegacyId ? dmMessageInputByConversation[activeDmLegacyId] ?? "" : "";
	const setActiveDmMessageInput = (value) => {
		if (!activeDmLegacyId) return;
		setDmMessageInputByConversation((current) => ({
			...current,
			[activeDmLegacyId]: value
		}));
		if (value.trim().length > 0) notifyDmTyping();
	};
	const handleSendDirectMessage = async (content) => {
		const trimmed = content.trim();
		const hasPendingAttachments = pendingAttachments.length > 0;
		if (!trimmed && !hasPendingAttachments) return;
		let uploadedAttachments = [];
		if (hasPendingAttachments) {
			uploadedAttachments = await uploadPendingAttachments(pendingAttachments);
			if (!trimmed && uploadedAttachments.length === 0) return;
		}
		await dmSendMessage(trimmed, uploadedAttachments.length > 0 ? uploadedAttachments : void 0);
		if (activeDmLegacyId) setDmMessageInputByConversation((current) => ({
			...current,
			[activeDmLegacyId]: ""
		}));
		clearPendingAttachments();
	};
	const unifiedItems = (() => {
		const items = [];
		for (const channel of channels) {
			const summary = channelSummaries.get(channel.id);
			const unreadCount = channelUnreadCounts[channel.id] ?? 0;
			items.push({
				id: channel.id,
				legacyId: channel.id,
				type: "channel",
				name: channel.name,
				lastMessageSnippet: summary?.lastMessage ?? null,
				lastMessageAtMs: summary?.lastTimestamp ? new Date(summary.lastTimestamp).getTime() : null,
				isRead: unreadCount <= 0,
				unreadCount,
				metadata: {
					channelType: channel.type,
					channelAvatarUrl: channel.avatarUrl ?? null
				},
				originalData: channel
			});
		}
		for (const conv of dmConversations) items.push({
			id: conv.legacyId,
			legacyId: conv.legacyId,
			type: "direct_message",
			name: conv.otherParticipantName,
			lastMessageSnippet: conv.lastMessageSnippet ?? null,
			lastMessageAtMs: conv.lastMessageAtMs ?? null,
			isRead: conv.isRead,
			unreadCount: conv.unreadCount ?? (conv.isRead ? 0 : 1),
			metadata: { otherParticipantRole: conv.otherParticipantRole },
			originalData: conv
		});
		return items.sort((a, b) => (b.lastMessageAtMs ?? 0) - (a.lastMessageAtMs ?? 0));
	})();
	const filteredItems = unifiedItems.filter((item) => {
		if (sourceFilter !== "all" && item.type !== sourceFilter) return false;
		if (!searchQuery.trim()) return true;
		const query = searchQuery.toLowerCase();
		return item.name?.toLowerCase().includes(query) || item.lastMessageSnippet?.toLowerCase().includes(query) || item.type === "direct_message" && item.originalData.otherParticipantName?.toLowerCase().includes(query);
	});
	const totalUnread = unifiedItems.reduce((sum, item) => sum + item.unreadCount, 0);
	const channelCount = channels.length;
	const dmCount = dmConversations.length;
	const isLoading = isLoadingChannels || isLoadingDMs;
	const isChannelSearchActive = messageSearchQuery.trim().length > 0;
	const isDmSearchActive = dmMessageSearchQuery.trim().length > 0;
	const topLevelChannelMessages = channelMessages.filter((message) => !message?.parentMessageId);
	const channelMessagesForPane = isChannelSearchActive ? visibleMessages : topLevelChannelMessages;
	const dmMessagesForPane = isDmSearchActive ? dmVisibleMessages : dmMessages;
	const typingIndicatorText = (() => {
		const activeTypingParticipants = selectedChannel ? typingParticipants : selectedDM ? dmTypingParticipants : [];
		if (activeTypingParticipants.length === 0) return;
		const names = activeTypingParticipants.flatMap((participant) => {
			const name = participant.name;
			return typeof name === "string" && name.trim().length > 0 ? [name] : [];
		});
		if (names.length === 0) return;
		if (names.length === 1) return `${names[0]} is typing...`;
		if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
		return `${names[0]}, ${names[1]}, and ${names.length - 2} others are typing...`;
	})();
	const handleSelectItem = (item) => {
		if (item.type === "channel") onSelectChannel(item.id);
		else onSelectDM(item.originalData);
	};
	const isSelected = (item) => {
		if (item.type === "channel") return selectedChannel?.id === item.id;
		return selectedDM?.legacyId === item.legacyId;
	};
	const hasActiveConversation = Boolean(selectedChannel || selectedDM);
	const handleBackToInbox = () => {
		onBackToInbox?.();
	};
	return {
		searchQuery,
		setSearchQuery,
		sourceFilter,
		setSourceFilter,
		filteredItems,
		totalUnread,
		channelCount,
		dmCount,
		isLoading,
		channelMessagesForPane,
		dmMessagesForPane,
		isChannelSearchActive,
		isDmSearchActive,
		typingIndicatorText,
		handleSelectItem,
		isSelected,
		hasActiveConversation,
		handleBackToInbox,
		dmMessageInput,
		setActiveDmMessageInput,
		handleSendDirectMessage
	};
}
function UnifiedInbox({ currentUserId, sidebar, channelPane, directMessagePane, manageChannel }) {
	const { onNewDM, onBackToInbox } = sidebar;
	const { selectedChannel, channelMessages, channelParticipants, mentionParticipants, messageSearchQuery, onMessageSearchChange, searchHighlights, searchingMessages, isCurrentChannelLoading, onLoadMore, canLoadMore, loadingMore, messageInput, onMessageInputChange, onSendMessage, onShareToPlatform, onCreateTask, onForwardMessage, onCreatePoll, onExportChannel, onOpenChannelMessage, sending, pendingAttachments, onAddAttachments, onRemoveAttachment, uploading, onComposerFocus, onComposerBlur, onEditMessage, onDeleteMessage, onToggleReaction, messageUpdatingId, messageDeletingId, currentUserRole, threadMessagesByRootId, threadNextCursorByRootId, threadLoadingByRootId, threadErrorsByRootId, threadUnreadCountsByRootId, onLoadThreadReplies, onLoadMoreThreadReplies, onMarkThreadAsRead, reactionPendingByMessage, sharedFiles, onClearDeepLink, deepLinkMessageId, deepLinkThreadId, messagesError, onRetryMessages, channelUnreadCount, onMarkChannelRead, markChannelReadPending, workspaceId, isAdmin } = channelPane;
	const { selectedDM, isLoadingMessages: dmIsLoadingMessages, isLoadingMore: dmIsLoadingMore, hasMoreMessages: dmHasMoreMessages, loadMoreMessages: dmLoadMoreMessages, messageSearchQuery: dmMessageSearchQuery, onMessageSearchChange: onDmMessageSearchChange, searchHighlights: dmSearchHighlights, searchingMessages: dmSearchingMessages, isSending: dmIsSending, toggleReaction: dmToggleReaction, deleteMessage: dmDeleteMessage, editMessage: dmEditMessage, archiveConversation: dmArchiveConversation, muteConversation: dmMuteConversation, onStartNewDM, messagesError: dmMessagesError, onRetryMessages: onDmRetryMessages, handleComposerFocus: dmHandleComposerFocus, handleComposerBlur: dmHandleComposerBlur, onCreateTask: dmOnCreateTask, currentUserRole: dmCurrentUserRole, workspaceId: dmWorkspaceId, deepLinkMessageId: dmDeepLinkMessageId, onClearDeepLink: dmOnClearDeepLink } = directMessagePane;
	const canManageSelectedChannel = manageChannel?.canManageSelectedChannel ?? false;
	const onManageSelectedChannel = manageChannel?.onManageSelectedChannel;
	const inbox = useUnifiedInboxController({
		sidebar,
		channelPane,
		directMessagePane,
		onBackToInbox
	});
	const listState = {
		canLoadMore,
		loading: isCurrentChannelLoading,
		loadingMore
	};
	const searchState = {
		active: inbox.isChannelSearchActive,
		searching: searchingMessages
	};
	const composerState = {
		sending,
		uploading
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col overflow-hidden max-lg:min-h-[min(72dvh,640px)] lg:h-[640px] lg:flex-row",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConversationListPane, {
			className: cn(inbox.hasActiveConversation && "max-lg:hidden"),
			channelCount: inbox.channelCount,
			dmCount: inbox.dmCount,
			filteredItems: inbox.filteredItems,
			isLoading: inbox.isLoading,
			isSelected: inbox.isSelected,
			onNewDM,
			onSearchQueryChange: inbox.setSearchQuery,
			onSelectItem: inbox.handleSelectItem,
			onSourceFilterChange: inbox.setSourceFilter,
			searchQuery: inbox.searchQuery,
			sourceFilter: inbox.sourceFilter,
			totalUnread: inbox.totalUnread
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("flex min-h-0 min-w-0 flex-1 flex-col border-muted/40 max-lg:border-t lg:border-t-0", !inbox.hasActiveConversation && "max-lg:hidden"),
			children: selectedChannel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelConversationPane, {
				listState,
				searchState,
				composerState,
				channelMessages,
				channelMessagesForPane: inbox.channelMessagesForPane,
				channelParticipants,
				mentionParticipants,
				currentUserId,
				currentUserRole,
				deepLinkMessageId: deepLinkMessageId ?? null,
				deepLinkThreadId: deepLinkThreadId ?? null,
				messageDeletingId,
				messageInput,
				messageSearchQuery,
				messageUpdatingId,
				onAddAttachments,
				onBackToInbox: inbox.handleBackToInbox,
				onComposerBlur,
				onComposerFocus,
				onDeleteMessage,
				onEditMessage,
				onLoadMore,
				onLoadMoreThreadReplies,
				onLoadThreadReplies,
				onMarkThreadAsRead,
				onMessageInputChange,
				onMessageSearchChange,
				onRemoveAttachment,
				onSendMessage,
				onShareToPlatform,
				onCreateTask,
				onForwardMessage,
				onCreatePoll,
				onExportChannel,
				onOpenChannelMessage,
				onToggleReaction,
				pendingAttachments,
				reactionPendingByMessage,
				searchHighlights,
				onClearDeepLink,
				messagesError,
				onRetryMessages,
				selectedChannel,
				sharedFiles,
				canManageMembers: canManageSelectedChannel,
				onManageMembers: onManageSelectedChannel,
				threadErrorsByRootId,
				threadLoadingByRootId,
				threadMessagesByRootId,
				threadNextCursorByRootId,
				threadUnreadCountsByRootId,
				typingIndicatorText: inbox.typingIndicatorText,
				channelUnreadCount,
				onMarkChannelRead,
				markChannelReadPending,
				workspaceId,
				isAdmin
			}) : selectedDM ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DirectMessageConversationPane, {
				mentionParticipants,
				currentUserId,
				dmDeleteMessage,
				dmEditMessage,
				dmHasMoreMessages,
				dmIsLoadingMessages,
				dmIsLoadingMore,
				dmIsSending,
				dmLoadMoreMessages,
				dmMessageInput: inbox.dmMessageInput,
				dmMessageSearchQuery,
				dmMessagesForPane: inbox.dmMessagesForPane,
				dmMuteConversation,
				dmSearchHighlights,
				dmSearchingMessages,
				dmToggleReaction,
				handleSendDirectMessage: inbox.handleSendDirectMessage,
				isDmSearchActive: inbox.isDmSearchActive,
				onAddAttachments,
				onArchiveConversation: dmArchiveConversation,
				onBackToInbox: inbox.handleBackToInbox,
				onDmMessageSearchChange,
				onRemoveAttachment,
				pendingAttachments,
				selectedDM,
				setActiveDmMessageInput: inbox.setActiveDmMessageInput,
				uploading,
				onStartNewDM,
				messagesError: dmMessagesError,
				onRetryMessages: onDmRetryMessages,
				onShareToPlatform,
				onComposerFocus: dmHandleComposerFocus,
				onComposerBlur: dmHandleComposerBlur,
				typingIndicatorText: inbox.typingIndicatorText,
				onCreateTask: dmOnCreateTask,
				currentUserRole: dmCurrentUserRole,
				workspaceId: dmWorkspaceId,
				deepLinkMessageId: dmDeepLinkMessageId,
				onClearDeepLink: dmOnClearDeepLink
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyConversationPane, {
				channelCount: inbox.channelCount,
				dmCount: inbox.dmCount,
				onNewDM
			})
		})]
	});
}
function NewDMDialog({ open, onOpenChange, onUserSelect, workspaceId, currentUserId, currentUserRole }) {
	const { isPreviewMode } = usePreview();
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [isCreating, setIsCreating] = (0, import_react.useState)(false);
	const dmParticipants = useQuery(api$1.users.listDMParticipants, !isPreviewMode && workspaceId && currentUserId ? {
		workspaceId,
		currentUserId,
		currentUserRole: currentUserRole ?? null
	} : "skip");
	const filteredUsers = (() => {
		return (isPreviewMode ? getPreviewCollaborationParticipants().flatMap((participant) => participant.id !== currentUserId ? [{
			id: participant.id,
			name: participant.name,
			email: participant.email,
			role: participant.role
		}] : []) : Array.isArray(dmParticipants) ? dmParticipants : []).filter((member) => {
			if (!searchQuery.trim()) return true;
			const query = searchQuery.toLowerCase();
			return member.name?.toLowerCase().includes(query) || member.email?.toLowerCase().includes(query);
		});
	})();
	const handleSearchChange = (event) => {
		setSearchQuery(event.target.value);
	};
	const handleUserClick = async (user) => {
		setIsCreating(true);
		await onUserSelect({
			id: user.id,
			name: user.name ?? "Unknown User",
			role: user.role
		}).finally(() => {
			setIsCreating(false);
			setSearchQuery("");
		});
	};
	const userClickHandlers = Object.fromEntries(filteredUsers.map((user) => [user.id, () => handleUserClick(user)]));
	const getInitials = (name) => {
		if (!name) return "?";
		return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "New Direct Message" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Select a teammate to start a conversation." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: searchQuery,
						onChange: handleSearchChange,
						placeholder: "Search teammates…",
						className: "pl-9"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
					className: "h-[300px] mt-4",
					children: filteredUsers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center justify-center py-8 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-12 text-muted-foreground/40 mb-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: searchQuery ? "No teammates match your search." : "No teammates available."
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-1 pr-4",
						children: filteredUsers.map((user) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: userClickHandlers[user.id],
							disabled: isCreating,
							className: "w-full flex items-center gap-3 p-3 rounded-lg text-left motion-chromatic hover:bg-muted/50 disabled:opacity-50",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
									className: "size-10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
										className: "bg-accent/10 text-primary text-sm",
										children: getInitials(user.name)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-foreground truncate",
										children: user.name ?? "Unknown User"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground truncate",
										children: user.email
									})]
								}),
								user.role && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "text-xs",
									children: user.role
								}),
								isCreating && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-muted-foreground" })
							]
						}, user.id))
					})
				})
			]
		})
	});
}
var CREATE_CHANNEL_DEFAULT_TRIGGER = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
	asChild: true,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		className: "gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Create channel"]
	})
});
var EMPTY_TEAM_MEMBERS = [];
var INITIAL_CREATE_CHANNEL_DIALOG_STATE = {
	open: false,
	channelName: "",
	description: "",
	visibility: "private",
	selectedMemberIds: [],
	isCreating: false
};
function createChannelDialogReducer(state, action) {
	switch (action.type) {
		case "setOpen": return {
			...state,
			open: action.open
		};
		case "setChannelName": return {
			...state,
			channelName: action.channelName
		};
		case "setDescription": return {
			...state,
			description: action.description
		};
		case "setVisibility": return {
			...state,
			visibility: action.visibility
		};
		case "toggleMember": return {
			...state,
			selectedMemberIds: state.selectedMemberIds.includes(action.memberId) ? state.selectedMemberIds.filter((id) => id !== action.memberId) : [...state.selectedMemberIds, action.memberId]
		};
		case "setIsCreating": return {
			...state,
			isCreating: action.isCreating
		};
		case "resetForm": return {
			...state,
			channelName: "",
			description: "",
			visibility: "private",
			selectedMemberIds: []
		};
		default: return state;
	}
}
function sortMembers(members) {
	return members.toSorted((a, b) => a.name.localeCompare(b.name));
}
function ChannelMemberOptionRow({ checked, disabled = false, member, onToggle }) {
	const checkboxId = `create-channel-member-${member.id}`;
	const handleToggle = () => onToggle(member.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex cursor-pointer items-start gap-3 rounded-xl border border-transparent bg-background/80 p-3 transition-colors hover:border-border hover:bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
			id: checkboxId,
			checked,
			onCheckedChange: handleToggle,
			disabled,
			className: "mt-0.5"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
			htmlFor: checkboxId,
			className: "min-w-0 cursor-pointer",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate text-sm font-medium text-foreground",
				children: member.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate text-xs text-muted-foreground",
				children: [member.role, member.email].filter(Boolean).join(" • ") || "Workspace member"
			})]
		})]
	});
}
function CreateChannelDialog({ workspaceId, userId, teamMembers = EMPTY_TEAM_MEMBERS, onCreate, trigger }) {
	const [{ open, channelName, description, visibility, selectedMemberIds, isCreating }, dispatch] = (0, import_react.useReducer)(createChannelDialogReducer, INITIAL_CREATE_CHANNEL_DIALOG_STATE);
	const sortedMembers = sortMembers(teamMembers);
	const resetForm = () => {
		dispatch({ type: "resetForm" });
	};
	const handleMemberToggle = (memberId) => {
		dispatch({
			type: "toggleMember",
			memberId
		});
	};
	const handleOpenChange = (nextOpen) => {
		if (!nextOpen && isCreating) return;
		dispatch({
			type: "setOpen",
			open: nextOpen
		});
		if (!nextOpen) resetForm();
	};
	const handleChannelNameChange = (event) => {
		dispatch({
			type: "setChannelName",
			channelName: event.target.value
		});
	};
	const handleDescriptionChange = (event) => {
		dispatch({
			type: "setDescription",
			description: event.target.value
		});
	};
	const handleVisibilityChange = (value) => {
		dispatch({
			type: "setVisibility",
			visibility: value
		});
	};
	const handleCancel = () => {
		if (isCreating) return;
		dispatch({
			type: "setOpen",
			open: false
		});
	};
	const handleCreate = async () => {
		if (isCreating) return;
		if (!workspaceId || !userId) {
			notifyFailure({
				title: "Authentication required",
				message: "You must be signed in to create channels."
			});
			return;
		}
		const normalizedName = channelName.replace(/\s+/g, " ").trim();
		if (normalizedName.length < 2) {
			notifyFailure({
				title: "Channel name required",
				message: "Use at least 2 characters for the channel name."
			});
			return;
		}
		dispatch({
			type: "setIsCreating",
			isCreating: true
		});
		try {
			await onCreate({
				name: normalizedName,
				description: description.trim() || void 0,
				visibility,
				memberIds: selectedMemberIds
			});
			notifySuccess({
				title: "Channel created",
				message: `#${normalizedName} is ready for collaboration.`
			});
			resetForm();
			dispatch({
				type: "setOpen",
				open: false
			});
		} catch (error) {
			reportConvexFailure({
				error,
				context: "CreateChannelDialog:handleCreate",
				title: "Channel creation failed",
				fallbackMessage: "Channel creation failed"
			});
		}
		dispatch({
			type: "setIsCreating",
			isCreating: false
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: handleOpenChange,
		children: [trigger ?? CREATE_CHANNEL_DEFAULT_TRIGGER, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, { className: "size-5" }), "Create collaboration channel"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Create an admin-managed room for internal coordination. Client and project channels remain automatic." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 py-4 lg:grid-cols-[1.15fr_0.85fr]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "channel-name",
									children: "Channel name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "channel-name",
										value: channelName,
										onChange: handleChannelNameChange,
										disabled: isCreating,
										className: "pl-9",
										placeholder: "leadership, launch-war-room, finance",
										maxLength: 50
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "channel-description",
									children: "Description"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									id: "channel-description",
									value: description,
									onChange: handleDescriptionChange,
									disabled: isCreating,
									placeholder: "What should this channel be used for?",
									rows: 4,
									maxLength: 220
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "channel-visibility",
										children: "Access"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: visibility,
										onValueChange: handleVisibilityChange,
										disabled: isCreating,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											id: "channel-visibility",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "private",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4" }), "Private"]
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "public",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }), "Public to team"]
											})
										})] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Private channels are limited to admins and selected members. Public channels are visible to the workspace team."
									})
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border/70 bg-muted/20 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-foreground",
								children: "Add people"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Select who should be explicitly included."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded-full bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground",
								children: [selectedMemberIds.length, " selected"]
							})]
						}), sortedMembers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-xl border border-dashed border-border/70 bg-background/70 px-4 py-6 text-sm text-muted-foreground",
							children: "No workspace members available."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "max-h-80 space-y-2 overflow-y-auto pr-1",
							children: sortedMembers.map((member) => {
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelMemberOptionRow, {
									checked: selectedMemberIds.includes(member.id),
									disabled: isCreating,
									member,
									onToggle: handleMemberToggle
								}, member.id);
							})
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: handleCancel,
					disabled: isCreating,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: handleCreate,
					disabled: isCreating,
					children: [isCreating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Create channel"]
				})] })
			]
		})]
	});
}
function createInitialChannelMembersDialogFormState(channel) {
	return {
		selectedMemberIds: Array.isArray(channel.memberIds) ? channel.memberIds : [],
		visibility: channel.visibility === "public" ? "public" : "private",
		saving: false,
		deleting: false,
		confirmDeleteOpen: false
	};
}
function channelMembersDialogFormReducer(state, action) {
	switch (action.type) {
		case "setSelectedMemberIds": return {
			...state,
			selectedMemberIds: typeof action.value === "function" ? action.value(state.selectedMemberIds) : action.value
		};
		case "setVisibility": return {
			...state,
			visibility: action.value
		};
		case "setSaving": return {
			...state,
			saving: action.value
		};
		case "setDeleting": return {
			...state,
			deleting: action.value
		};
		case "setConfirmDeleteOpen": return {
			...state,
			confirmDeleteOpen: action.value
		};
		default: return state;
	}
}
function ChannelMembersDialogForm({ channel, teamMembers, onOpenChange, onSave, onDelete }) {
	const [state, dispatch] = (0, import_react.useReducer)(channelMembersDialogFormReducer, channel, createInitialChannelMembersDialogFormState);
	const { selectedMemberIds, visibility, saving, deleting, confirmDeleteOpen } = state;
	const sortedMembers = teamMembers.toSorted((a, b) => a.name.localeCompare(b.name));
	const handleVisibilityChange = (value) => {
		dispatch({
			type: "setVisibility",
			value
		});
	};
	const handleOpenDeleteConfirm = () => {
		dispatch({
			type: "setConfirmDeleteOpen",
			value: true
		});
	};
	const handleCloseDialog = () => {
		onOpenChange(false);
	};
	const handleMemberToggle = (memberId) => {
		dispatch({
			type: "setSelectedMemberIds",
			value: (prev) => prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
		});
	};
	const handleSave = () => {
		dispatch({
			type: "setSaving",
			value: true
		});
		Promise.resolve(onSave({
			memberIds: selectedMemberIds,
			visibility
		})).then(() => {
			notifySuccess({
				title: "Channel updated",
				message: "Access settings were saved."
			});
			onOpenChange(false);
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "ChannelMembersDialog:handleSave",
				title: "Could not save channel",
				fallbackMessage: "Could not save channel"
			});
		}).finally(() => {
			dispatch({
				type: "setSaving",
				value: false
			});
		});
	};
	const memberToggleHandlers = Object.fromEntries(sortedMembers.map((member) => [member.id, () => handleMemberToggle(member.id)]));
	const handleDelete = () => {
		if (!channel.isCustom || !onDelete) return;
		dispatch({
			type: "setDeleting",
			value: true
		});
		Promise.resolve(onDelete()).then(() => {
			dispatch({
				type: "setConfirmDeleteOpen",
				value: false
			});
			onOpenChange(false);
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "ChannelMembersDialog:handleDelete",
				title: "Could not delete channel",
				fallbackMessage: "Could not delete channel"
			});
		}).finally(() => {
			dispatch({
				type: "setDeleting",
				value: false
			});
		});
	};
	const handleConfirmDeleteOpenChange = (open) => {
		dispatch({
			type: "setConfirmDeleteOpen",
			value: open
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: "sm:max-w-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-5" }), "Manage channel access"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Update who can access this channel and whether the wider team can see it." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-2xl border border-border/70 bg-muted/20 p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm font-semibold text-foreground",
								children: ["#", channel.name]
							}), channel.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: channel.description
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "No description yet."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								className: "gap-1.5",
								children: [visibility === "private" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5" }), visibility === "private" ? "Private" : "Public to team"]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Access" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: visibility,
							onValueChange: handleVisibilityChange,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "private",
								children: "Private"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "public",
								children: "Public to team"
							})] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Members" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground",
								children: [selectedMemberIds.length, " selected"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "max-h-96 space-y-2 overflow-y-auto rounded-2xl border border-border/70 bg-background/80 p-2",
							children: sortedMembers.map((member) => {
								const checked = selectedMemberIds.includes(member.id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: memberToggleHandlers[member.id],
									className: "flex w-full cursor-pointer items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-muted/40",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
										checked,
										className: "mt-0.5 pointer-events-none",
										"aria-label": `Toggle access for ${member.name}`
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-sm font-medium text-foreground",
											children: member.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-xs text-muted-foreground",
											children: [member.role, member.email].filter(Boolean).join(" • ") || "Workspace member"
										})]
									})]
								}, member.id);
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [
				channel.isCustom && onDelete ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "destructive",
					onClick: handleOpenDeleteConfirm,
					disabled: saving || deleting,
					className: "mr-auto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "Delete channel"]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: handleCloseDialog,
					disabled: saving || deleting,
					children: "Cancel"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: handleSave,
					disabled: saving || deleting,
					children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }), "Save access"]
				})
			] })
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
		open: confirmDeleteOpen,
		onOpenChange: handleConfirmDeleteOpenChange,
		title: "Delete channel?",
		description: `This will permanently remove #${channel.name} and its message history for everyone.`,
		confirmLabel: deleting ? "Deleting..." : "Delete channel",
		variant: "destructive",
		isLoading: deleting,
		onConfirm: handleDelete
	})] });
}
function ChannelMembersDialog({ open, onOpenChange, channel, teamMembers, onSave, onDelete }) {
	const dialogKey = `${channel?.id ?? "no-channel"}:${open ? "open" : "closed"}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: channel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelMembersDialogForm, {
			channel,
			teamMembers,
			onOpenChange,
			onSave,
			onDelete
		}, dialogKey) : null
	});
}
function useCrossChannelSearchController({ onSearch, onResultClick }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)("");
	const [isSearching, setIsSearching] = (0, import_react.useState)(false);
	const [results, setResults] = (0, import_react.useState)([]);
	const [selectedChannelType, setSelectedChannelType] = (0, import_react.useState)("all");
	const [hasAttachment, setHasAttachment] = (0, import_react.useState)(false);
	const [hasLink, setHasLink] = (0, import_react.useState)(false);
	const filterState = {
		selectedChannelType,
		hasAttachment,
		hasLink
	};
	const hasActiveFilters = selectedChannelType !== "all" || hasAttachment || hasLink;
	const handleSearch = async () => {
		if (!query.trim() || isSearching) return;
		setIsSearching(true);
		await onSearch({
			query: query.trim(),
			channelType: selectedChannelType === "all" ? void 0 : selectedChannelType,
			hasAttachment: hasAttachment || void 0,
			hasLink: hasLink || void 0
		}).then((searchResults) => {
			setResults(searchResults);
		}).catch((error) => {
			logError(error, "CrossChannelSearch:handleSearch");
			setResults([]);
			reportConvexFailure({
				error,
				context: "cross-channel-search.tsx:catch",
				title: "Search failed",
				fallbackMessage: "Search failed"
			});
		}).finally(() => {
			setIsSearching(false);
		});
	};
	const handleKeyDown = (event) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			handleSearch();
		}
	};
	const clearFilters = () => {
		setSelectedChannelType("all");
		setHasAttachment(false);
		setHasLink(false);
	};
	const clearSearch = () => {
		setQuery("");
		setResults([]);
		clearFilters();
	};
	const handleToggleAttachment = () => {
		setHasAttachment((current) => !current);
	};
	const handleToggleLink = () => {
		setHasLink((current) => !current);
	};
	const handleResultClick = (result) => {
		const threadRootId = result.message.threadRootId?.trim() || result.message.parentMessageId?.trim() || null;
		onResultClick?.(result.message.id, result.channel.id, threadRootId);
		setOpen(false);
		setQuery("");
		setResults([]);
	};
	return {
		open,
		setOpen,
		query,
		setQuery,
		isSearching,
		results,
		filterState,
		hasActiveFilters,
		handleSearch,
		handleKeyDown,
		handleResultClick,
		clearFilters,
		clearSearch,
		setSelectedChannelType,
		setHasAttachment,
		setHasLink,
		handleToggleAttachment,
		handleToggleLink
	};
}
function CrossChannelSearchBar({ query, isSearching, onQueryChange, onKeyDown, onSearch }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Search messages…",
				value: query,
				onChange: onQueryChange,
				onKeyDown,
				className: "pl-9"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: onSearch,
			disabled: !query.trim() || isSearching,
			children: isSearching ? "Searching…" : "Search"
		})]
	});
}
function CrossChannelSearchFilters({ filterState, hasActiveFilters, onChannelTypeChange, onToggleAttachment, onToggleLink, onClear }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1",
				children: [
					"all",
					"team",
					"client",
					"project"
				].map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrossChannelSearchFilterButton, {
					variant: filterState.selectedChannelType === type ? "default" : "outline",
					size: "sm",
					onSelect: onChannelTypeChange,
					value: type,
					className: "capitalize",
					children: type
				}, type))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: filterState.hasAttachment ? "default" : "outline",
				size: "sm",
				onClick: onToggleAttachment,
				className: "gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "size-3" }), "Has attachment"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: filterState.hasLink ? "default" : "outline",
				size: "sm",
				onClick: onToggleLink,
				className: "gap-1",
				children: "🔗 Has link"
			}),
			hasActiveFilters ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "ghost",
				size: "sm",
				onClick: onClear,
				className: "gap-1 text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" }), "Clear"]
			}) : null
		]
	});
}
function CrossChannelSearchFilterButton({ variant, size, onSelect, value, className, children }) {
	const onSelectFilter = () => {
		onSelect(value);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		variant,
		size,
		onClick: onSelectFilter,
		className,
		children
	});
}
function CrossChannelSearchResults({ query, isSearching, results, onResultClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex-1 overflow-y-auto -mx-6 px-6",
		children: [
			results.length === 0 && query && !isSearching ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center justify-center py-12 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mb-4 size-12 text-muted-foreground/50" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground",
						children: "No messages found"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Try adjusting your search or filters"
					})
				]
			}) : null,
			results.length === 0 && !query ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center justify-center py-12 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "mb-4 size-12 text-muted-foreground/50" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground",
						children: "Search across all channels"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Type a message content, sender name, or use filters"
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-1",
				children: results.map((result) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchResultItem, {
					result,
					onSelect: onResultClick
				}, `${result.channel.id}-${result.message.id}`))
			})
		]
	});
}
function CrossChannelSearchResultsFooter({ count }) {
	if (count === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-t pt-3 text-sm text-muted-foreground",
		children: [
			"Found ",
			count,
			" result",
			count !== 1 ? "s" : ""
		]
	});
}
/**
* Cross-channel message search dialog with advanced filters
*/
function CrossChannelSearch({ onSearch, onResultClick, trigger }) {
	const { open, setOpen, query, setQuery, isSearching, results, filterState, hasActiveFilters, handleSearch, handleKeyDown, handleResultClick, clearSearch, setSelectedChannelType, handleToggleAttachment, handleToggleLink } = useCrossChannelSearchController({
		onSearch,
		onResultClick
	});
	const handleQueryChange = (event) => {
		setQuery(event.target.value);
	};
	const handleSearchClick = () => {
		handleSearch();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [trigger ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				className: "gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }), "Search"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-2xl max-h-[80vh] flex flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Search Messages" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Search across all channels for messages, attachments, and more." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrossChannelSearchBar, {
					query,
					isSearching,
					onQueryChange: handleQueryChange,
					onKeyDown: handleKeyDown,
					onSearch: handleSearchClick
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrossChannelSearchFilters, {
					filterState,
					hasActiveFilters,
					onChannelTypeChange: setSelectedChannelType,
					onToggleAttachment: handleToggleAttachment,
					onToggleLink: handleToggleLink,
					onClear: clearSearch
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrossChannelSearchResults, {
					query,
					isSearching,
					results,
					onResultClick: handleResultClick
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrossChannelSearchResultsFooter, { count: results.length })
			]
		})]
	});
}
function SearchResultItem({ result, onSelect }) {
	const { message, channel, highlights } = result;
	const onSelectSearchResult = () => {
		onSelect(result);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: onSelectSearchResult,
		className: "w-full text-left p-3 hover:bg-muted/50 rounded-lg transition-colors group",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-medium text-primary flex-shrink-0",
					children: message.senderName.charAt(0).toUpperCase()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 flex-wrap",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-sm",
									children: message.senderName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "text-xs capitalize",
									children: channel.type
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: channel.name
								}),
								message.createdAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientRelativeTime, {
									value: message.createdAt,
									className: "text-xs text-muted-foreground"
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm line-clamp-2 mt-1",
							children: message.content
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 mt-1.5",
							children: [
								message.attachments && message.attachments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "size-3" }), message.attachments.length]
								}),
								message.mentions && message.mentions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AtSign, { className: "size-3" }), message.mentions.length]
								}),
								message.reactions && message.reactions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex items-center gap-1 text-xs text-muted-foreground",
									children: message.reactions.map((r) => r.emoji).join(" ")
								})
							]
						}),
						highlights.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1 mt-2",
							children: highlights.slice(0, 3).map((highlight) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "px-1.5 py-0.5 bg-accent/10 text-primary text-xs rounded",
								children: highlight
							}, `${result.message.id}-${highlight}`))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-1" })
			]
		})
	});
}
function useCrossChannelCollaborationSearch(workspaceId, channels) {
	const convex = useConvex();
	return async (query) => {
		if (!workspaceId) return [];
		const trimmed = query.query.trim();
		if (!trimmed) return [];
		const scopedChannels = channels.filter((channel) => {
			if (query.channelId && channel.id !== query.channelId) return false;
			if (query.channelType && channel.type !== query.channelType) return false;
			return true;
		});
		const results = [];
		await Promise.all(scopedChannels.map(async (channel) => {
			try {
				const resolvedPayload = await convex.query(collaborationApi.searchChannel, {
					workspaceId,
					channelId: channel.id,
					channelType: channel.type,
					clientId: channel.clientId,
					projectId: channel.projectId,
					q: trimmed,
					sender: query.sender ?? null,
					attachment: query.hasAttachment ? trimmed : null,
					mention: null,
					startMs: query.afterDate ? new Date(query.afterDate).getTime() : null,
					endMs: query.beforeDate ? new Date(query.beforeDate).getTime() : null,
					limit: 40
				}) ?? {};
				const rows = Array.isArray(resolvedPayload.rows) ? resolvedPayload.rows : [];
				const highlights = Array.isArray(resolvedPayload.highlights) ? resolvedPayload.highlights.filter((entry) => typeof entry === "string") : [];
				for (const row of rows) {
					const message = mapCollaborationMessageRow(row, { fallbackChannelType: channel.type });
					if (!message) continue;
					const content = message.content ?? "";
					if (query.hasLink && !/https?:\/\//i.test(content)) continue;
					results.push({
						message,
						channel,
						highlights
					});
				}
			} catch (error) {
				logError(error, "useCrossChannelCollaborationSearch:searchChannel");
			}
		}));
		return results.sort((left, right) => {
			const leftMs = left.message.createdAt ? new Date(left.message.createdAt).getTime() : 0;
			return (right.message.createdAt ? new Date(right.message.createdAt).getTime() : 0) - leftMs;
		});
	};
}
function useSmartDefaults() {
	const { user } = useAuth();
	const { selectedClient, selectedClientId } = useClientContext();
	const { selectedProject, selectedProjectId, isFromUrl } = useProjectContext();
	return {
		taskDefaults: (() => {
			return {
				clientId: selectedClientId || null,
				client: selectedClient?.name || null,
				projectId: selectedProjectId || null,
				projectName: selectedProject?.name || null,
				assignedTo: user?.id ? [user.id] : [],
				priority: "medium",
				status: "todo",
				dueDate: new Date(Date.now() + 10080 * 60 * 1e3).toISOString(),
				description: ""
			};
		})(),
		contextInfo: {
			clientId: selectedClientId || null,
			clientName: selectedClient?.name || null,
			projectId: selectedProjectId || null,
			projectName: selectedProject?.name || null,
			userId: user?.id || null,
			isAutoPopulated: isFromUrl || !!selectedClientId
		}
	};
}
function PrioritySelectItem({ value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("size-2 shrink-0 rounded-full", priorityAccentColors[value]),
			"aria-hidden": true
		}), formatPriorityLabel(value)]
	});
}
function TaskCreationModalFormFields({ title, description, priority, dueDate, projectName, clientName, assigneeCount, error, isLoading, pendingAttachments, fileInputRef, onTitleChange, onDescriptionChange, onPriorityChange, onDateSelect, onAddAttachments, onRemoveAttachment, onCancel }) {
	const handleTitleChange = (event) => onTitleChange(event.target.value);
	const handleDescriptionChange = (event) => onDescriptionChange(event.target.value);
	const handlePriorityChange = (value) => onPriorityChange(value);
	const handleOpenFileDialog = () => {
		fileInputRef.current?.click();
	};
	const handleFilesChange = (event) => {
		onAddAttachments(event.target.files);
		event.currentTarget.value = "";
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TaskFormSection, {
			title: "Essentials",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskFormField, {
				id: "quick-task-title",
				label: "Title",
				required: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "quick-task-title",
					placeholder: "What needs to get done?",
					value: title,
					onChange: handleTitleChange,
					required: true,
					disabled: isLoading,
					className: TASKS_THEME.input
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskFormField, {
				id: "quick-task-description",
				label: "Description",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "quick-task-description",
					placeholder: "Optional context or next steps",
					value: description,
					onChange: handleDescriptionChange,
					rows: 3,
					disabled: isLoading,
					className: TASKS_THEME.textarea
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskFormSection, {
			title: "Scheduling",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskFormField, {
					id: "quick-task-priority",
					label: "Priority",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: priority,
						onValueChange: handlePriorityChange,
						disabled: isLoading,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							id: "quick-task-priority",
							className: TASKS_THEME.selectTrigger,
							disabled: isLoading,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Priority" })
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
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskFormField, {
					id: "quick-task-due",
					label: "Due date",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							id: "quick-task-due",
							type: "button",
							variant: "outline",
							className: cn(TASKS_THEME.selectTrigger, "w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground"),
							disabled: isLoading,
							"aria-label": "Due date, open calendar",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "mr-2 size-4 shrink-0" }), dueDate ? format(parseISO(dueDate), "PPP") : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pick a date" })]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
						className: "w-auto p-0",
						align: "start",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar$1, {
							mode: "single",
							selected: dueDate ? parseISO(dueDate) : void 0,
							disabled: isTaskDueDateDisabled,
							onSelect: onDateSelect,
							initialFocus: true
						})
					})] })
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TaskFormSection, {
			title: "Context",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskFormField, {
					label: "Client",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskContextChip, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn(!clientName && "text-muted-foreground"),
						children: clientName || "None"
					}) })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskFormField, {
					label: "Project",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskContextChip, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn(!projectName && "text-muted-foreground"),
						children: projectName || "None"
					}) })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskFormField, {
				label: "Assigned to",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskContextChip, { children: assigneeCount > 0 ? `${assigneeCount} teammate${assigneeCount === 1 ? "" : "s"}` : "Unassigned" })
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TaskFormSection, {
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
						disabled: isLoading,
						onClick: handleOpenFileDialog,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "size-3.5" }), "Attach"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: fileInputRef,
					type: "file",
					multiple: true,
					"aria-label": "Attach files to task",
					className: "hidden",
					onChange: handleFilesChange
				}),
				pendingAttachments.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PendingAttachmentsList, {
					attachments: pendingAttachments,
					uploading: isLoading,
					onRemove: onRemoveAttachment
				}) : null
			]
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskModalError, { message: error }) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: TASKS_THEME.dialog.footer,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskModalActions, {
				onCancel,
				submitLabel: "Create task",
				loadingLabel: "Creating…",
				isLoading,
				submitDisabled: !title.trim()
			})
		})
	] });
}
function TaskCreationModal({ isOpen, onClose, initialData, onTaskCreated }) {
	const { user } = useAuth();
	const { selectedClientId, selectedClient } = useClientContext();
	const { taskDefaults, contextInfo } = useSmartDefaults();
	const fileInputRef = (0, import_react.useRef)(null);
	const convex = useConvex();
	const defaultDueDate = taskDefaults.dueDate && isFutureTaskDueDateValue(taskDefaults.dueDate) ? taskDefaults.dueDate : "";
	const createTask = useMutation(tasksApi.createTask);
	const generateUploadUrlMutation = useMutation(filesApi.generateUploadUrl);
	const syncMetadataMutation = useMutation(filesApi.syncMetadata);
	const generateUploadUrl = () => generateUploadUrlMutation({});
	const syncMetadata = (args) => syncMetadataMutation(args);
	const [isPending, startTransition] = (0, import_react.useTransition)();
	const [error, setError] = (0, import_react.useState)(null);
	const [pendingAttachments, setPendingAttachments] = (0, import_react.useState)([]);
	const [formData, setFormData] = (0, import_react.useState)({
		title: initialData?.title || "",
		description: initialData?.description || "",
		priority: taskDefaults.priority || "medium",
		dueDate: defaultDueDate,
		assignedTo: taskDefaults.assignedTo || [],
		projectId: initialData?.projectId || taskDefaults.projectId || "",
		projectName: initialData?.projectName || taskDefaults.projectName || ""
	});
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!formData.title.trim()) return;
		if (formData.dueDate && !isFutureTaskDueDateValue(formData.dueDate)) {
			setError("Due date must be today or later.");
			return;
		}
		if (!user?.id) {
			setError("You must be signed in to create tasks.");
			return;
		}
		if (!user?.agencyId) {
			setError("Workspace context missing");
			return;
		}
		startTransition(async () => {
			setError(null);
			const payload = {
				title: formData.title.trim(),
				description: formData.description.trim() || void 0,
				priority: formData.priority,
				status: "todo",
				dueDate: formData.dueDate || void 0,
				assignedTo: formData.assignedTo,
				clientId: selectedClientId || void 0,
				client: selectedClient?.name || void 0,
				projectId: formData.projectId || void 0,
				projectName: formData.projectName || void 0
			};
			const attachmentsPromise = pendingAttachments.length > 0 ? Promise.all(pendingAttachments.map((attachment) => uploadTaskAttachment({
				userId: user.id,
				file: attachment.file,
				generateUploadUrl,
				syncMetadata,
				getPublicUrl: (args) => convex.query(filesApi.getPublicUrl, {
					workspaceId: user.agencyId,
					storageId: args.storageId
				})
			}))) : Promise.resolve([]);
			try {
				const attachments = await attachmentsPromise;
				const legacyId = await createTask({
					workspaceId: user.agencyId,
					title: payload.title,
					description: payload.description ?? null,
					status: payload.status,
					priority: payload.priority,
					assignedTo: payload.assignedTo,
					clientId: payload.clientId ?? "",
					client: payload.client ?? null,
					projectId: payload.projectId ?? null,
					projectName: payload.projectName ?? null,
					dueDateMs: payload.dueDate ? Date.parse(payload.dueDate) : null,
					attachments
				});
				if (!legacyId) {
					const message = "Failed to create task";
					setError(message);
					notifyFailure({
						title: "Failed to create task",
						message
					});
					return;
				}
				const createdTask = {
					id: legacyId,
					title: payload.title,
					description: payload.description ?? null,
					status: payload.status,
					priority: payload.priority,
					assignedTo: payload.assignedTo,
					clientId: payload.clientId ?? null,
					client: payload.client ?? null,
					projectId: payload.projectId ?? null,
					projectName: payload.projectName ?? null,
					dueDate: payload.dueDate ?? null,
					attachments,
					createdAt: (/* @__PURE__ */ new Date()).toISOString(),
					updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
					deletedAt: null
				};
				notifySuccess({
					title: "Task created!",
					message: `"${createdTask.title}" has been added and is ready to track.`
				});
				onTaskCreated?.(createdTask);
				emitDashboardRefresh({
					reason: "task-mutated",
					clientId: createdTask.clientId ?? selectedClientId ?? null
				});
				onClose();
				setFormData({
					title: "",
					description: "",
					priority: taskDefaults.priority || "medium",
					dueDate: defaultDueDate,
					assignedTo: taskDefaults.assignedTo || [],
					projectId: taskDefaults.projectId || "",
					projectName: taskDefaults.projectName || ""
				});
				setPendingAttachments([]);
			} catch (err) {
				logError(err, "TaskCreationModal:submit");
				const message = asErrorMessage(err);
				setError(message);
				notifyFailure({
					title: "Failed to create task",
					message
				});
			}
		});
	};
	const handleAddAttachments = (files) => {
		if (!files || files.length === 0) return;
		const next = buildPendingTaskAttachments(files);
		setPendingAttachments((prev) => [...prev, ...next].slice(0, 10));
	};
	const handleRemoveAttachment = (attachmentId) => {
		setPendingAttachments((prev) => prev.filter((item) => item.id !== attachmentId));
	};
	const handleDateSelect = (date) => {
		setFormData((prev) => ({
			...prev,
			dueDate: date ? format(date, "yyyy-MM-dd") : ""
		}));
	};
	const handleTitleChange = (value) => {
		setFormData((prev) => ({
			...prev,
			title: value
		}));
	};
	const handleDescriptionChange = (value) => {
		setFormData((prev) => ({
			...prev,
			description: value
		}));
	};
	const handlePriorityChange = (value) => {
		setFormData((prev) => ({
			...prev,
			priority: value
		}));
	};
	const handleOpenChange = (open) => {
		if (!open) onClose();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveFormSheet, {
		open: isOpen,
		onOpenChange: handleOpenChange,
		contentClassName: TASKS_THEME.sheet.content,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "flex h-full min-h-0 flex-col",
			onSubmit: handleSubmit,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: TASKS_THEME.sheet.header,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn(getIconContainerClasses("medium"), "size-10 shrink-0"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListTodo, {
							className: "size-5",
							"aria-hidden": true
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold tracking-tight text-foreground",
							children: "Create task"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: contextInfo.isAutoPopulated ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-success",
								children: "Pre-filled from your current workspace context."
							}) : "Add a task without leaving this screen."
						})]
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: TASKS_THEME.sheet.body,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCreationModalFormFields, {
					title: formData.title,
					description: formData.description,
					priority: formData.priority,
					dueDate: formData.dueDate,
					projectName: formData.projectName,
					clientName: contextInfo.clientName,
					assigneeCount: formData.assignedTo.length,
					error,
					isLoading: isPending,
					pendingAttachments,
					fileInputRef,
					onTitleChange: handleTitleChange,
					onDescriptionChange: handleDescriptionChange,
					onPriorityChange: handlePriorityChange,
					onDateSelect: handleDateSelect,
					onAddAttachments: handleAddAttachments,
					onRemoveAttachment: handleRemoveAttachment,
					onCancel: onClose
				})
			})]
		})
	});
}
function exportChannelMessages({ channelName, messages }) {
	if (messages.length === 0) return;
	const headers = [
		"Date",
		"Sender",
		"Role",
		"Content",
		"Attachments",
		"Reactions",
		"Thread Replies"
	];
	const rows = messages.map((msg) => {
		const date = msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "";
		const attachments = (msg.attachments || []).map((attachment) => attachment.url).join("; ");
		const reactions = (msg.reactions || []).map((reaction) => `${reaction.emoji}(${reaction.count})`).join(" ");
		return [
			date,
			msg.senderName,
			msg.senderRole || "",
			msg.content || "",
			attachments,
			reactions,
			msg.threadReplyCount || 0
		];
	});
	const chartRows = messages.map((msg) => ({
		date: msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "",
		sender: msg.senderName
	}));
	exportCohortsSpreadsheetRows({
		filename: `${channelName.replace(/[^a-z0-9]/gi, "_")}_export.xlsx`,
		title: `${channelName} messages`,
		subtitle: `${rows.length} message${rows.length === 1 ? "" : "s"}`,
		sheetName: "Messages",
		headers,
		rows,
		charts: buildCollaborationExportCharts(chartRows)
	});
}
/**
* Dialog for forwarding a message to another channel
*/
function MessageForwardDialog({ message, channels, workspaceId, userId, open, onOpenChange, onForward }) {
	const createMessage = useMutation(collaborationApi.createMessage);
	const [selectedChannelId, setSelectedChannelId] = (0, import_react.useState)("");
	const [forwardMessage, setForwardMessage] = (0, import_react.useState)("");
	const [includeAttachments, setIncludeAttachments] = (0, import_react.useState)(true);
	const [isForwarding, setIsForwarding] = (0, import_react.useState)(false);
	const selectedChannel = channels.find((c) => c.id === selectedChannelId);
	const handleForward = async () => {
		if (isForwarding) return;
		if (!message || !workspaceId || !userId || !selectedChannel) {
			notifyFailure({
				title: "Cannot forward message",
				message: "Please select a channel to forward to."
			});
			return;
		}
		setIsForwarding(true);
		const newMessageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		const forwardedContent = forwardMessage.trim() ? `${forwardMessage.trim()}\n\n---\n\n*Forwarded message from ${message.senderName}:*\n\n${message.content}` : `*Forwarded message from ${message.senderName}:*\n\n${message.content}`;
		const attachments = includeAttachments && message.attachments ? message.attachments : void 0;
		await createMessage({
			workspaceId: String(workspaceId),
			legacyId: newMessageId,
			channelType: selectedChannel.type,
			clientId: selectedChannel.type === "client" ? selectedChannel.id : null,
			projectId: selectedChannel.type === "project" ? selectedChannel.id : null,
			senderId: String(userId),
			senderName: "You",
			senderRole: null,
			content: forwardedContent,
			format: "markdown",
			attachments,
			mentions: [],
			isThreadRoot: true
		}).then(() => {
			notifySuccess({
				title: "Message forwarded",
				message: `Message has been forwarded to ${selectedChannel.name}.`
			});
			onForward?.();
			onOpenChange(false);
			setSelectedChannelId("");
			setForwardMessage("");
			setIncludeAttachments(true);
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "MessageForwardDialog:handleForward",
				title: "Failed to forward message",
				fallbackMessage: "Failed to forward message"
			});
		}).finally(() => {
			setIsForwarding(false);
		});
	};
	const handleOpenChange = (newOpen) => {
		if (!newOpen) {
			setSelectedChannelId("");
			setForwardMessage("");
			setIncludeAttachments(true);
		}
		onOpenChange(newOpen);
	};
	const handleIncludeAttachmentsChange = (checked) => {
		setIncludeAttachments(checked === true);
	};
	const handleForwardMessageChange = (event) => {
		setForwardMessage(event.target.value);
	};
	const handleCloseClick = () => {
		handleOpenChange(false);
	};
	if (!message) return null;
	const availableChannels = channels.filter((c) => c.id !== `${message.channelType}-${message.clientId || message.projectId || "general"}`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: handleOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Forward, { className: "size-5" }), "Forward Message"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Send this message to another channel" })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-3 rounded-lg bg-muted/50",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground mb-1",
									children: "Original message:"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm line-clamp-3",
									children: message.content
								}),
								message.attachments && message.attachments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground mt-2",
									children: [
										"📎 ",
										message.attachments.length,
										" attachment",
										message.attachments.length > 1 ? "s" : ""
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "channel",
								children: "Forward to"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: selectedChannelId,
								onValueChange: setSelectedChannelId,
								disabled: isForwarding,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "channel",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select a channel" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [availableChannels.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: channel.id,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs uppercase text-muted-foreground",
											children: channel.type
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: channel.name })]
									})
								}, channel.id)), availableChannels.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-2 text-sm text-muted-foreground text-center",
									children: "No other channels available"
								})] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "message",
									children: "Add a message (optional)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									id: "message",
									placeholder: "Add context or comments before the forwarded message…",
									value: forwardMessage,
									onChange: handleForwardMessageChange,
									disabled: isForwarding,
									rows: 3,
									maxLength: 500
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground text-right",
									children: [forwardMessage.length, "/500"]
								})
							]
						}),
						message.attachments && message.attachments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-x-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								id: "attachments",
								checked: includeAttachments,
								onCheckedChange: handleIncludeAttachmentsChange,
								disabled: isForwarding
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
								htmlFor: "attachments",
								className: "text-sm font-normal cursor-pointer",
								children: [
									"Include attachments (",
									message.attachments.length,
									")"
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					onClick: handleCloseClick,
					disabled: isForwarding,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: handleForward,
					disabled: !selectedChannelId || isForwarding,
					children: isForwarding ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Forwarding…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Forward, { className: "mr-2 size-4" }), "Forward"] })
				})] })
			]
		})
	});
}
function useCollaborationChannelExtras({ channel, channelMessages, channels, currentUserId, workspaceId, onSendPollMessage }) {
	const [taskModalOpen, setTaskModalOpen] = (0, import_react.useState)(false);
	const [taskSourceMessage, setTaskSourceMessage] = (0, import_react.useState)(null);
	const [forwardDialogOpen, setForwardDialogOpen] = (0, import_react.useState)(false);
	const [forwardSourceMessage, setForwardSourceMessage] = (0, import_react.useState)(null);
	const forwardChannelOptions = channels.map((entry) => ({
		id: entry.id,
		name: entry.name,
		type: entry.type
	}));
	const handleExportChannel = () => {
		if (!channel || channelMessages.length === 0) return;
		exportChannelMessages({
			channelName: channel.name,
			messages: channelMessages
		});
	};
	const handleCreateTask = (message) => {
		setTaskSourceMessage(channelMessages.find((entry) => entry.id === message.id) ?? {
			id: message.id,
			channelType: channel?.type ?? "team",
			clientId: channel?.clientId ?? null,
			projectId: channel?.projectId ?? null,
			content: message.content,
			senderId: message.senderId,
			senderName: message.senderName,
			senderRole: message.senderRole ?? null,
			createdAt: new Date(message.createdAtMs).toISOString(),
			updatedAt: null,
			isEdited: Boolean(message.edited),
			deletedAt: message.deletedAt ?? null,
			deletedBy: message.deletedBy ?? null,
			isDeleted: Boolean(message.deleted)
		});
		setTaskModalOpen(true);
	};
	const handleForwardMessage = (message) => {
		const original = channelMessages.find((entry) => entry.id === message.id);
		if (!original) return;
		setForwardSourceMessage(original);
		setForwardDialogOpen(true);
	};
	const handleCreatePoll = async (poll) => {
		if (!onSendPollMessage) return;
		await onSendPollMessage(encodePollMessage(poll));
	};
	const handleTaskCreated = (task) => {
		notifySuccess({
			title: "Task created",
			message: task.title ? `"${task.title}" was added from this message.` : "The task was added from this message."
		});
		setTaskModalOpen(false);
		setTaskSourceMessage(null);
	};
	const handleTaskModalClose = () => {
		setTaskModalOpen(false);
		setTaskSourceMessage(null);
	};
	const handleForwardComplete = () => {
		setForwardDialogOpen(false);
		setForwardSourceMessage(null);
	};
	return {
		handleCreateTask,
		handleExportChannel,
		handleForwardMessage,
		handleCreatePoll,
		taskModal: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TaskCreationModal, {
			isOpen: taskModalOpen,
			onClose: handleTaskModalClose,
			onTaskCreated: handleTaskCreated,
			initialData: {
				title: taskSourceMessage ? `Task from: ${taskSourceMessage.content?.slice(0, 50)}...` : "",
				description: taskSourceMessage?.content || "",
				projectId: channel?.projectId || channel?.id || "",
				projectName: channel?.name || ""
			}
		}),
		forwardDialog: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageForwardDialog, {
			open: forwardDialogOpen,
			onOpenChange: setForwardDialogOpen,
			message: forwardSourceMessage,
			channels: forwardChannelOptions,
			workspaceId,
			userId: currentUserId,
			onForward: handleForwardComplete
		})
	};
}
function createUnifiedInboxSidebarProps(context) {
	const { collab, dm, handleSelectChannel, handleSelectDM, openNewDMDialog } = context;
	return {
		channels: collab.channels,
		channelSummaries: collab.channelSummaries,
		channelUnreadCounts: collab.channelUnreadCounts,
		dmConversations: dm.conversations,
		selectedChannel: collab.selectedChannel,
		selectedDM: dm.selectedConversation,
		onSelectChannel: handleSelectChannel,
		onSelectDM: handleSelectDM,
		onNewDM: openNewDMDialog,
		onBackToInbox: () => {
			handleSelectChannel(null);
			handleSelectDM(null);
		},
		isLoadingChannels: collab.isBootstrapping,
		isLoadingDMs: dm.isLoadingConversations
	};
}
function createUnifiedInboxChannelPaneProps(context, mentionParticipants, channelExtras, onShareToPlatform) {
	const { collab, clearMessageFocus, currentUserId, handleOpenChannelMessage, requestedMessageId, requestedThreadId, workspaceId } = context;
	return {
		selectedChannel: collab.selectedChannel,
		channelMessages: collab.channelMessages,
		visibleMessages: collab.visibleMessages,
		channelParticipants: collab.channelParticipants,
		mentionParticipants,
		messageSearchQuery: collab.messageSearchQuery,
		onMessageSearchChange: collab.setMessageSearchQuery,
		searchHighlights: collab.searchHighlights,
		searchingMessages: collab.searchingMessages,
		isCurrentChannelLoading: collab.isCurrentChannelLoading,
		onLoadMore: collab.handleLoadMore,
		canLoadMore: collab.canLoadMore,
		loadingMore: collab.loadingMore,
		messageInput: collab.messageInput,
		onMessageInputChange: collab.setMessageInput,
		onSendMessage: collab.handleSendMessage,
		onShareToPlatform,
		onCreateTask: channelExtras.handleCreateTask,
		onForwardMessage: channelExtras.handleForwardMessage,
		onCreatePoll: channelExtras.handleCreatePoll,
		onExportChannel: channelExtras.handleExportChannel,
		onOpenChannelMessage: handleOpenChannelMessage,
		sending: collab.sending,
		pendingAttachments: collab.pendingAttachments,
		onAddAttachments: collab.handleAddAttachments,
		onRemoveAttachment: collab.handleRemoveAttachment,
		uploading: collab.uploading,
		typingParticipants: collab.typingParticipants,
		onComposerFocus: collab.handleComposerFocus,
		onComposerBlur: collab.handleComposerBlur,
		onEditMessage: collab.handleEditMessage,
		onDeleteMessage: collab.handleDeleteMessage,
		onToggleReaction: collab.handleToggleReaction,
		messageUpdatingId: collab.messageUpdatingId,
		messageDeletingId: collab.messageDeletingId,
		currentUserRole: collab.currentUserRole,
		threadMessagesByRootId: collab.threadMessagesByRootId,
		threadNextCursorByRootId: collab.threadNextCursorByRootId,
		threadLoadingByRootId: collab.threadLoadingByRootId,
		threadErrorsByRootId: collab.threadErrorsByRootId,
		threadUnreadCountsByRootId: collab.threadUnreadCountsByRootId,
		onLoadThreadReplies: collab.loadThreadReplies,
		onLoadMoreThreadReplies: collab.loadMoreThreadReplies,
		onMarkThreadAsRead: collab.markThreadAsRead,
		reactionPendingByMessage: collab.reactionPendingByMessage,
		sharedFiles: collab.sharedFiles,
		onClearDeepLink: clearMessageFocus,
		deepLinkMessageId: requestedMessageId,
		deepLinkThreadId: requestedThreadId,
		messagesError: collab.messagesError,
		onRetryMessages: collab.retryMessagesError,
		channelUnreadCount: collab.selectedChannel != null ? collab.channelUnreadCounts[collab.selectedChannel.id] ?? 0 : 0,
		onMarkChannelRead: collab.markChannelRead,
		markChannelReadPending: collab.markChannelReadPending,
		workspaceId: context.workspaceId,
		isAdmin: context.isAdmin
	};
}
function createUnifiedInboxDirectMessagePaneProps(context, channelExtras) {
	const { clearMessageFocus, collab, currentUserRole, dm, openNewDMDialog, requestedMessageId, workspaceId } = context;
	return {
		typingParticipants: dm.typingParticipants,
		notifyDmTyping: dm.notifyDmTyping,
		handleComposerFocus: dm.handleComposerFocus,
		handleComposerBlur: dm.handleComposerBlur,
		selectedDM: dm.selectedConversation,
		messages: dm.messages,
		visibleMessages: dm.visibleMessages,
		isLoadingMessages: dm.isLoadingMessages,
		isLoadingMore: dm.isLoadingMore,
		hasMoreMessages: dm.hasMoreMessages,
		loadMoreMessages: dm.loadMoreMessages,
		messageSearchQuery: dm.messageSearchQuery,
		onMessageSearchChange: dm.setMessageSearchQuery,
		searchHighlights: dm.searchHighlights,
		searchingMessages: dm.searchingMessages,
		sendMessage: dm.sendMessage,
		isSending: dm.isSending,
		toggleReaction: dm.toggleReaction,
		deleteMessage: dm.deleteMessage,
		editMessage: dm.editMessage,
		archiveConversation: dm.archiveConversation,
		muteConversation: dm.muteConversation,
		pendingAttachments: collab.pendingAttachments,
		clearPendingAttachments: collab.clearPendingAttachments,
		uploadPendingAttachments: collab.uploadPendingAttachments,
		uploading: collab.uploading,
		onAddAttachments: collab.handleAddAttachments,
		onRemoveAttachment: collab.handleRemoveAttachment,
		onStartNewDM: openNewDMDialog,
		messagesError: dm.messagesError,
		onRetryMessages: dm.retryMessagesError,
		onCreateTask: channelExtras.handleCreateTask,
		currentUserRole,
		workspaceId,
		deepLinkMessageId: requestedMessageId,
		onClearDeepLink: clearMessageFocus
	};
}
function createUnifiedInboxManageChannelProps(context) {
	const { isAdmin, selectedCustomChannel, openManageMembersDialog } = context;
	if (!isAdmin || !selectedCustomChannel) return;
	return {
		canManageSelectedChannel: true,
		onManageSelectedChannel: openManageMembersDialog
	};
}
function CollaborationDashboard() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollaborationDashboardProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollaborationDashboardContent, {}) });
}
function CollaborationDashboardContent() {
	const { collab } = useCollaborationDashboardContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeletonBoundary, {
		loading: collab.isBootstrapping,
		loadingContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollaborationSkeleton, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: DASHBOARD_THEME.layout.container,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollaborationHeaderSection, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollaborationProjectBanner, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollaborationUrlWarnings, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollaborationInboxSection, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelMembersDialogSection, {})
			]
		})
	});
}
function CollaborationUrlWarnings() {
	const { dismissUnresolvedChannelUrl, dismissUnresolvedConversationUrl, unresolvedChannelUrl, unresolvedConversationUrl } = useCollaborationDashboardContext();
	if (!unresolvedChannelUrl && !unresolvedConversationUrl) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-4 mb-3 space-y-2",
		children: [unresolvedChannelUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
			variant: "destructive",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Channel link unavailable" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "We couldn't open the channel from this link. You may not have access or it no longer exists." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					onClick: dismissUnresolvedChannelUrl,
					children: "Dismiss"
				})]
			})]
		}) : null, unresolvedConversationUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
			variant: "destructive",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Conversation link unavailable" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "We couldn't open the direct message from this link. It may have been removed or you no longer have access." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					onClick: dismissUnresolvedConversationUrl,
					children: "Dismiss"
				})]
			})]
		}) : null]
	});
}
function CollaborationHeaderSection() {
	const { collab, currentUserId, currentUserRole, handleCreateChannel, handleOpenChannelMessage, handleSelectChannel, isAdmin, workspaceId, workspaceMembers } = useCollaborationDashboardContext();
	const searchAcrossChannels = useCrossChannelCollaborationSearch(workspaceId, collab.channels);
	const handleSearchResultClick = (messageId, channelId, threadRootId) => {
		handleSelectChannel(channelId);
		handleOpenChannelMessage(messageId, { threadId: threadRootId ?? null });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardPageHero, {
		innerClassName: "relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: DASHBOARD_THEME.layout.title,
				children: PAGE_TITLES.collaboration?.title ?? "Team Collaboration"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn(DASHBOARD_THEME.layout.subtitle, "max-w-2xl text-pretty"),
				children: PAGE_TITLES.collaboration?.description ?? "Coordinate with teammates and clients in dedicated workspaces."
			})]
		}), currentUserRole !== "client" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full shrink-0 flex-wrap items-center gap-3 sm:w-auto sm:justify-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CrossChannelSearch, {
				onSearch: searchAcrossChannels,
				onResultClick: handleSearchResultClick
			}), isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateChannelDialog, {
				workspaceId,
				userId: currentUserId,
				teamMembers: workspaceMembers,
				onCreate: handleCreateChannel
			}) : null]
		}) : null]
	});
}
function CollaborationProjectBanner() {
	const { clearProjectFilter, requestedProjectId, requestedProjectName } = useCollaborationDashboardContext();
	if (!isFeatureEnabled("BIDIRECTIONAL_NAV") || !requestedProjectId && !requestedProjectName) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-4 mb-3 flex items-center justify-between rounded-md border border-muted/40 bg-muted/10 px-3 py-2 text-xs text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "font-medium",
			children: ["Viewing collaboration for project: ", requestedProjectName || "Selected Project"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "outline",
				size: "sm",
				className: "h-6 text-xs",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
					href: `/dashboard/projects?projectId=${requestedProjectId}&projectName=${encodeURIComponent(requestedProjectName || "")}`,
					children: "View Project"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				size: "icon",
				className: "size-6 hover:text-foreground",
				onClick: clearProjectFilter,
				"aria-label": "Clear project filter from collaboration",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
					className: "size-3.5",
					"aria-hidden": true
				})
			})]
		})]
	});
}
function CollaborationInboxSection() {
	const context = useCollaborationDashboardContext();
	const { collab, currentUserId, currentUserRole, handleStartNewDM, isNewDMDialogOpen, setIsNewDMDialogOpen, workspaceId, workspaceMembers } = context;
	const { sendCollaborationEmailCopy } = useCollaborationExternalNotify();
	const handleShareToPlatform = async (message, platform) => {
		if (platform !== "email" || !workspaceId) return;
		const channelMessage = collab.channelMessages.find((entry) => entry.id === message.id);
		if (channelMessage) {
			await sendCollaborationEmailCopy(channelMessage, workspaceId);
			return;
		}
		const dmMessage = context.dm.messages.find((entry) => entry.legacyId === message.id);
		if (!dmMessage) return;
		await sendCollaborationEmailCopy({
			id: dmMessage.legacyId,
			channelType: "team",
			clientId: null,
			projectId: null,
			content: dmMessage.content,
			senderId: dmMessage.senderId,
			senderName: dmMessage.senderName,
			senderRole: dmMessage.senderRole ?? null,
			createdAt: new Date(dmMessage.createdAtMs).toISOString(),
			updatedAt: null,
			isEdited: Boolean(dmMessage.edited),
			deletedAt: dmMessage.deletedAtMs ? new Date(dmMessage.deletedAtMs).toISOString() : null,
			deletedBy: dmMessage.deletedBy ?? null,
			isDeleted: Boolean(dmMessage.deleted)
		}, workspaceId);
	};
	const mentionParticipants = (() => {
		const members = /* @__PURE__ */ new Map();
		collab.channelParticipants.forEach((participant) => {
			const key = participant.name.trim().toLowerCase();
			if (!key || members.has(key)) return;
			members.set(key, participant);
		});
		workspaceMembers.forEach((member) => {
			const name = member.name.trim();
			const key = name.toLowerCase();
			if (!key || members.has(key)) return;
			members.set(key, {
				id: member.id,
				name,
				role: member.role?.trim() || "Contributor"
			});
		});
		return Array.from(members.values()).sort((left, right) => left.name.localeCompare(right.name));
	})();
	const sidebar = createUnifiedInboxSidebarProps(context);
	const channelExtras = useCollaborationChannelExtras({
		channel: collab.selectedChannel,
		channelMessages: collab.channelMessages,
		channels: collab.channels,
		currentUserId,
		workspaceId,
		onSendPollMessage: collab.selectedChannel ? async (content) => {
			await collab.handleSendMessage({
				content,
				skipAttachmentUpload: true
			});
		} : void 0
	});
	const channelPane = createUnifiedInboxChannelPaneProps(context, mentionParticipants, channelExtras, handleShareToPlatform);
	const directMessagePane = createUnifiedInboxDirectMessagePaneProps(context, channelExtras);
	const manageChannel = createUnifiedInboxManageChannelProps(context);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: DASHBOARD_THEME.cards.base,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex min-h-0 flex-col overflow-hidden p-0 max-lg:min-h-[min(72dvh,640px)] lg:flex-row",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnifiedInbox, {
					currentUserId,
					sidebar,
					channelPane,
					directMessagePane,
					manageChannel
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewDMDialog, {
					open: isNewDMDialogOpen,
					onOpenChange: setIsNewDMDialogOpen,
					onUserSelect: handleStartNewDM,
					workspaceId,
					currentUserId,
					currentUserRole
				}),
				channelExtras.taskModal,
				channelExtras.forwardDialog
			]
		})
	});
}
function ChannelMembersDialogSection() {
	const { handleDeleteChannel, handleSaveChannelMembers, isManageMembersDialogOpen, selectedCustomChannel, setIsManageMembersDialogOpen, workspaceMembers } = useCollaborationDashboardContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelMembersDialog, {
		open: isManageMembersDialogOpen,
		onOpenChange: setIsManageMembersDialogOpen,
		channel: selectedCustomChannel,
		teamMembers: workspaceMembers,
		onSave: handleSaveChannelMembers,
		onDelete: handleDeleteChannel
	});
}
function CollaborationPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMotionShell, {
		reveal: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollaborationDashboard, {})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollaborationPage, {});
//#endregion
export { SplitComponent as component };
