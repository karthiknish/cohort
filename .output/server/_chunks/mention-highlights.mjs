import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { O as formatRelativeTime, t as cn } from "./utils.mjs";
import { n as useClientContext } from "./client-context.mjs";
import { n as useUrlSearchParamsContext } from "./use-url-search-params.mjs";
//#region src/lib/features.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* Feature Flags Configuration
*
* Phase 1 Navigation Enhancements
* - BREADCRUMBS: Mobile-responsive navigation breadcrumbs
* - BIDIRECTIONAL_NAV: Reverse navigation from tasks/collaboration to projects
* - NAVIGATION_PERSISTENCE: localStorage for remembering context per client
*/
var FEATURES = {
	BREADCRUMBS: process.env.NEXT_PUBLIC_FEATURE_BREADCRUMBS !== "false",
	BIDIRECTIONAL_NAV: process.env.NEXT_PUBLIC_FEATURE_BIDIRECTIONAL_NAV !== "false",
	NAVIGATION_PERSISTENCE: process.env.NEXT_PUBLIC_FEATURE_NAVIGATION_PERSISTENCE !== "false",
	ACTIVITY_WIDGET: process.env.NEXT_PUBLIC_FEATURE_ACTIVITY_WIDGET === "true"
};
/**
* Check if a feature is enabled
*/
function isFeatureEnabled(feature) {
	return FEATURES[feature];
}
//#endregion
//#region src/shared/contexts/navigation-context.tsx
var import_jsx_runtime = require_jsx_runtime();
var STORAGE_PREFIX = "cohorts.nav";
var STORAGE_KEYS = {
	PROJECT_ID: `${STORAGE_PREFIX}.projectId`,
	PROJECT_NAME: `${STORAGE_PREFIX}.projectName`,
	LAST_VIEWED_TASK: `${STORAGE_PREFIX}.lastViewedTask`,
	LAST_VIEWED_CHANNEL: `${STORAGE_PREFIX}.lastViewedChannel`
};
var NavigationContext = (0, import_react.createContext)(void 0);
function getClientStorageKey(baseKey, clientId) {
	return clientId ? `${baseKey}.${clientId}` : baseKey;
}
function NavigationProvider({ children }) {
	const { selectedClientId } = useClientContext();
	const searchParams = useUrlSearchParamsContext();
	const mountedRef = (0, import_react.useRef)(false);
	const [navigationState, setNavigationState] = (0, import_react.useState)({
		projectId: null,
		projectName: null,
		lastViewedTask: null,
		lastViewedChannel: null
	});
	const cleanupOldData = (0, import_react.useCallback)(() => {
		if (typeof window === "undefined") return;
		try {
			const navKeys = Object.keys(localStorage).filter((key) => key.startsWith(STORAGE_PREFIX));
			const clientKeys = /* @__PURE__ */ new Set();
			navKeys.forEach((key) => {
				const parts = key.split(".");
				const clientId = parts[2];
				if (parts.length >= 3 && clientId) clientKeys.add(clientId);
			});
			if (clientKeys.size > 10) {
				const clientArray = Array.from(clientKeys);
				clientArray.slice(0, clientArray.length - 10).forEach((clientId) => {
					Object.values(STORAGE_KEYS).forEach((baseKey) => {
						const key = getClientStorageKey(baseKey, clientId);
						localStorage.removeItem(key);
					});
				});
			}
		} catch (error) {
			console.warn("[NavigationProvider] Failed to cleanup old data:", error);
		}
	}, []);
	const loadNavigationState = (0, import_react.useCallback)(() => {
		if (typeof window === "undefined") return;
		try {
			cleanupOldData();
			setNavigationState({
				projectId: localStorage.getItem(getClientStorageKey(STORAGE_KEYS.PROJECT_ID, selectedClientId)),
				projectName: localStorage.getItem(getClientStorageKey(STORAGE_KEYS.PROJECT_NAME, selectedClientId)),
				lastViewedTask: localStorage.getItem(getClientStorageKey(STORAGE_KEYS.LAST_VIEWED_TASK, selectedClientId)),
				lastViewedChannel: localStorage.getItem(getClientStorageKey(STORAGE_KEYS.LAST_VIEWED_CHANNEL, selectedClientId))
			});
		} catch (error) {
			console.warn("[NavigationProvider] Failed to load navigation state:", error);
		}
	}, [selectedClientId, cleanupOldData]);
	const saveNavigationState = (state) => {
		if (!isFeatureEnabled("NAVIGATION_PERSISTENCE") || typeof window === "undefined") return;
		const projectId = state.projectId ?? "";
		const projectName = state.projectName ?? "";
		const lastViewedTask = state.lastViewedTask ?? "";
		const lastViewedChannel = state.lastViewedChannel ?? "";
		try {
			localStorage.setItem(getClientStorageKey(STORAGE_KEYS.PROJECT_ID, selectedClientId), projectId);
			localStorage.setItem(getClientStorageKey(STORAGE_KEYS.PROJECT_NAME, selectedClientId), projectName);
			localStorage.setItem(getClientStorageKey(STORAGE_KEYS.LAST_VIEWED_TASK, selectedClientId), lastViewedTask);
			localStorage.setItem(getClientStorageKey(STORAGE_KEYS.LAST_VIEWED_CHANNEL, selectedClientId), lastViewedChannel);
		} catch (error) {
			console.warn("[NavigationProvider] Failed to save navigation state:", error);
		}
	};
	(0, import_react.useEffect)(() => {
		if (!isFeatureEnabled("NAVIGATION_PERSISTENCE")) return;
		if (mountedRef.current && typeof window !== "undefined") {
			const frameId = window.requestAnimationFrame(() => {
				loadNavigationState();
			});
			return () => {
				window.cancelAnimationFrame(frameId);
			};
		}
	}, [selectedClientId, loadNavigationState]);
	(0, import_react.useEffect)(() => {
		if (mountedRef.current) return;
		mountedRef.current = true;
		if (typeof window === "undefined") return;
		if (isFeatureEnabled("NAVIGATION_PERSISTENCE")) {
			const frameId = window.requestAnimationFrame(() => {
				loadNavigationState();
			});
			return () => {
				window.cancelAnimationFrame(frameId);
			};
		}
	}, []);
	(0, import_react.useEffect)(() => {
		if (!isFeatureEnabled("NAVIGATION_PERSISTENCE")) return;
		const urlProjectId = searchParams.get("projectId");
		const urlProjectName = searchParams.get("projectName");
		if (urlProjectId || urlProjectName) {
			const frameId = requestAnimationFrame(() => {
				setNavigationState((prev) => ({
					...prev,
					projectId: urlProjectId,
					projectName: urlProjectName
				}));
			});
			return () => {
				cancelAnimationFrame(frameId);
			};
		}
	}, [searchParams]);
	const setProjectContext = (projectId, projectName) => {
		const newState = {
			...navigationState,
			projectId,
			projectName
		};
		setNavigationState(newState);
		saveNavigationState(newState);
	};
	const setLastViewedTask = (taskId) => {
		const newState = {
			...navigationState,
			lastViewedTask: taskId
		};
		setNavigationState(newState);
		saveNavigationState(newState);
	};
	const setLastViewedChannel = (channelId) => {
		const newState = {
			...navigationState,
			lastViewedChannel: channelId
		};
		setNavigationState(newState);
		saveNavigationState(newState);
	};
	const clearNavigationState = () => {
		setNavigationState({
			projectId: null,
			projectName: null,
			lastViewedTask: null,
			lastViewedChannel: null
		});
		if (isFeatureEnabled("NAVIGATION_PERSISTENCE") && typeof window !== "undefined") try {
			Object.values(STORAGE_KEYS).forEach((baseKey) => {
				const key = getClientStorageKey(baseKey, selectedClientId);
				localStorage.removeItem(key);
			});
		} catch (error) {
			console.warn("[NavigationProvider] Failed to clear navigation state:", error);
		}
	};
	const restoreNavigationState = () => {
		loadNavigationState();
	};
	const value = {
		navigationState,
		setProjectContext,
		setLastViewedTask,
		setLastViewedChannel,
		clearNavigationState,
		restoreNavigationState
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationContext.Provider, {
		value,
		children
	});
}
function useNavigationContext() {
	const context = (0, import_react.use)(NavigationContext);
	if (!context) throw new Error("useNavigationContext must be used within a NavigationProvider");
	return context;
}
//#endregion
//#region src/lib/hooks/use-client-relative-time.ts
function subscribeClientMounted(onStoreChange) {
	onStoreChange();
	return () => void 0;
}
function getClientMountedSnapshot() {
	return true;
}
function getServerMountedSnapshot() {
	return false;
}
function formatClientRelativeTime(value) {
	if (value === null || value === void 0 || value === "") return null;
	return formatRelativeTime(value);
}
/**
* Relative time label safe for SSR — empty until after mount, then formatted client-side.
*/
function useClientRelativeTime(value) {
	if (!(0, import_react.useSyncExternalStore)(subscribeClientMounted, getClientMountedSnapshot, getServerMountedSnapshot)) return null;
	return formatClientRelativeTime(value);
}
function subscribeNow(onStoreChange) {
	const intervalId = window.setInterval(onStoreChange, 6e4);
	return () => window.clearInterval(intervalId);
}
function getNowMsSnapshot() {
	return Date.now();
}
/** Milliseconds since epoch on the client; `0` during SSR. */
function useClientNowMs() {
	const isMounted = (0, import_react.useSyncExternalStore)(subscribeClientMounted, getClientMountedSnapshot, getServerMountedSnapshot);
	const nowMs = (0, import_react.useSyncExternalStore)(subscribeNow, getNowMsSnapshot, () => 0);
	return isMounted ? nowMs : 0;
}
/** Current time, null during SSR and until mount. */
function useClientNow() {
	const nowMs = useClientNowMs();
	if (nowMs === 0) return null;
	return new Date(nowMs);
}
//#endregion
//#region src/lib/agent-attachments.ts
var MAX_ATTACHMENT_TEXT_LENGTH = 12e3;
var MAX_ATTACHMENT_EXCERPT_LENGTH = 1800;
var TEXT_MIME_TYPES = new Set([
	"text/plain",
	"text/csv",
	"text/markdown",
	"application/json",
	"application/xml",
	"text/xml",
	"text/html"
]);
var ZIP_DOCUMENT_EXTENSIONS = new Set([
	"docx",
	"pptx",
	"xlsx",
	"odt",
	"ods",
	"odp"
]);
var XML_ENTRY_PATTERNS = {
	docx: [/^word\/document.xml$/],
	pptx: [/^ppt\/slides\/slide\d+\.xml$/],
	xlsx: [/^xl\/sharedStrings.xml$/, /^xl\/worksheets\/sheet\d+\.xml$/],
	odt: [/^content.xml$/],
	ods: [/^content.xml$/],
	odp: [/^content.xml$/]
};
var AGENT_ATTACHMENT_ACCEPT = [
	".txt",
	".md",
	".csv",
	".json",
	".xml",
	".html",
	".docx",
	".pptx",
	".xlsx",
	".odt",
	".ods",
	".odp",
	".pdf",
	".png",
	".jpg",
	".jpeg",
	".webp",
	".gif"
].join(",");
function createPendingAttachmentPlaceholder(file) {
	return {
		id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
		name: file.name,
		mimeType: file.type || "application/octet-stream",
		sizeLabel: formatFileSize(file.size),
		excerpt: "Reading file…",
		extractionStatus: "extracting"
	};
}
function isPersistableAttachment(attachment) {
	return attachment.extractionStatus !== "extracting";
}
function serializeAgentAttachmentsForStorage(attachments) {
	return attachments.flatMap((attachment) => isPersistableAttachment(attachment) ? [{
		id: attachment.id,
		name: attachment.name,
		mimeType: attachment.mimeType,
		sizeLabel: attachment.sizeLabel,
		excerpt: attachment.excerpt,
		extractedText: attachment.extractedText,
		extractionStatus: attachment.extractionStatus,
		errorMessage: attachment.errorMessage,
		storageId: attachment.storageId,
		url: attachment.url
	}] : []);
}
function toAgentRequestAttachmentContext(attachments) {
	return attachments.flatMap((attachment) => isPersistableAttachment(attachment) ? [{
		name: attachment.name,
		mimeType: attachment.mimeType,
		sizeLabel: attachment.sizeLabel,
		excerpt: attachment.excerpt,
		extractedText: attachment.extractedText,
		extractionStatus: attachment.extractionStatus,
		errorMessage: attachment.errorMessage
	}] : []);
}
function parseAgentAttachmentsFromStored(value) {
	if (!Array.isArray(value)) return void 0;
	const attachments = [];
	for (const entry of value) {
		if (!entry || typeof entry !== "object") continue;
		const record = entry;
		const id = typeof record.id === "string" ? record.id : null;
		const name = typeof record.name === "string" ? record.name : null;
		const mimeType = typeof record.mimeType === "string" ? record.mimeType : "application/octet-stream";
		const sizeLabel = typeof record.sizeLabel === "string" ? record.sizeLabel : "—";
		const excerpt = typeof record.excerpt === "string" ? record.excerpt : "";
		const status = record.extractionStatus;
		if (!id || !name) continue;
		if (status !== "ready" && status !== "limited" && status !== "failed") continue;
		attachments.push({
			id,
			name,
			mimeType,
			sizeLabel,
			excerpt,
			extractedText: typeof record.extractedText === "string" ? record.extractedText : void 0,
			extractionStatus: status,
			errorMessage: typeof record.errorMessage === "string" ? record.errorMessage : void 0,
			storageId: typeof record.storageId === "string" ? record.storageId : void 0,
			url: typeof record.url === "string" ? record.url : void 0
		});
	}
	return attachments.length > 0 ? attachments : void 0;
}
async function hydrateAgentAttachmentUrls(attachments, getPublicUrl) {
	if (!attachments?.length) return attachments;
	return await Promise.all(attachments.map(async (attachment) => {
		if (!attachment.storageId?.trim()) return attachment;
		if (attachment.url?.trim() && attachment.url !== "about:blank") return attachment;
		const resolved = await getPublicUrl({ storageId: attachment.storageId });
		if (!resolved?.url) return attachment;
		return {
			...attachment,
			url: resolved.url
		};
	}));
}
function agentAttachmentsToChatMedia(attachments) {
	return attachments.flatMap((attachment) => {
		const url = attachment.url?.trim();
		if (!url || url === "#" || url === "about:blank") return [];
		return [{
			name: attachment.name,
			url,
			type: attachment.mimeType,
			size: attachment.sizeLabel
		}];
	});
}
function formatFileSize(bytes) {
	if (!Number.isFinite(bytes) || bytes <= 0) return "1 KB";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function getFileExtension(fileName) {
	const extension = fileName.split(".").pop();
	return typeof extension === "string" ? extension.toLowerCase() : "";
}
function normalizeWhitespace(value) {
	return value.replace(/\s+/g, " ").trim();
}
function truncateText(value, maxLength) {
	if (value.length <= maxLength) return value;
	return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}
function stripXmlLikeMarkup(value) {
	return normalizeWhitespace(value.replace(/<\?xml[\s\S]*?\?>/gi, " ").replace(/<\/?(?:text|table|office|draw|style|svg):[^>]+>/gi, " ").replace(/<\/?[^>]+>/g, " "));
}
async function readPlainTextAttachment(file) {
	return truncateText(normalizeWhitespace(await file.text()), MAX_ATTACHMENT_TEXT_LENGTH);
}
async function readZipDocumentAttachment(file, extension) {
	const { default: JSZip } = await import("../_libs/exceljs+[...].mjs").then((n) => /* @__PURE__ */ __toESM(n.n(), 1));
	const zip = await JSZip.loadAsync(await file.arrayBuffer());
	const entryPatterns = XML_ENTRY_PATTERNS[extension] ?? [];
	const matchingNames = Object.keys(zip.files).filter((name) => entryPatterns.some((pattern) => pattern.test(name))).sort();
	const collectParts = async (index, parts) => {
		if (index >= matchingNames.length) return parts;
		if (parts.join(" ").length >= MAX_ATTACHMENT_TEXT_LENGTH) return parts;
		const entryName = matchingNames[index];
		if (!entryName) return collectParts(index + 1, parts);
		const entry = zip.file(entryName);
		if (!entry) return collectParts(index + 1, parts);
		const cleaned = stripXmlLikeMarkup(await entry.async("text"));
		if (!cleaned) return collectParts(index + 1, parts);
		return collectParts(index + 1, [...parts, cleaned]);
	};
	return truncateText(normalizeWhitespace((await collectParts(0, [])).join(" ")), MAX_ATTACHMENT_TEXT_LENGTH);
}
async function extractTextFromAttachment(file) {
	const extension = getFileExtension(file.name);
	const mimeType = file.type || "application/octet-stream";
	try {
		if (TEXT_MIME_TYPES.has(mimeType) || [
			"txt",
			"md",
			"csv",
			"json",
			"xml",
			"html"
		].includes(extension)) {
			const extractedText = await readPlainTextAttachment(file);
			return extractedText ? {
				extractedText,
				extractionStatus: "ready"
			} : {
				extractionStatus: "failed",
				errorMessage: "This file did not contain readable text."
			};
		}
		if (ZIP_DOCUMENT_EXTENSIONS.has(extension)) {
			const extractedText = await readZipDocumentAttachment(file, extension);
			return extractedText ? {
				extractedText,
				extractionStatus: "ready"
			} : {
				extractionStatus: "failed",
				errorMessage: "This document did not expose readable text."
			};
		}
		if (extension === "pdf" || mimeType === "application/pdf") return {
			extractionStatus: "limited",
			errorMessage: "PDF text could not be extracted. Add a short instruction if the important fields are not obvious."
		};
		if (mimeType.startsWith("image/") || [
			"png",
			"jpg",
			"jpeg",
			"webp",
			"gif"
		].includes(extension)) return {
			extractionStatus: "limited",
			errorMessage: "Image attached — stored in this chat. Describe what you need from it in your message."
		};
		return {
			extractionStatus: "failed",
			errorMessage: "This file type is not supported for context extraction yet."
		};
	} catch (error) {
		return {
			extractionStatus: "failed",
			errorMessage: error instanceof Error ? error.message : "Unable to read this attachment."
		};
	}
}
async function readFileAsBase64(file) {
	const buffer = await file.arrayBuffer();
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
	return btoa(binary);
}
function getPdfUploadSizeError(file) {
	const extension = getFileExtension(file.name);
	const mimeType = file.type || "application/octet-stream";
	if (!(extension === "pdf" || mimeType === "application/pdf") || file.size <= 768e3) return null;
	return "PDF is too large for import. Try a file under 750 KB or save as .docx.";
}
async function buildAgentAttachmentContext(file, options) {
	const extension = getFileExtension(file.name);
	const mimeType = file.type || "application/octet-stream";
	if ((extension === "pdf" || mimeType === "application/pdf") && options?.extractPdfOnServer) {
		const serverResult = await options.extractPdfOnServer(file);
		if (serverResult) {
			const extractedText = serverResult.extractedText;
			const excerptSource = extractedText ?? serverResult.errorMessage ?? "Attached for reference.";
			return {
				id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${file.name}`,
				name: file.name,
				mimeType,
				sizeLabel: formatFileSize(file.size),
				excerpt: truncateText(excerptSource, MAX_ATTACHMENT_EXCERPT_LENGTH),
				extractedText,
				extractionStatus: serverResult.extractionStatus,
				errorMessage: serverResult.errorMessage
			};
		}
	}
	const extracted = await extractTextFromAttachment(file);
	const extractedText = extracted.extractedText;
	const excerptSource = extractedText ?? extracted.errorMessage ?? "Attached for reference.";
	return {
		id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${file.name}`,
		name: file.name,
		mimeType: file.type || "application/octet-stream",
		sizeLabel: formatFileSize(file.size),
		excerpt: truncateText(excerptSource, MAX_ATTACHMENT_EXCERPT_LENGTH),
		extractedText,
		extractionStatus: extracted.extractionStatus,
		errorMessage: extracted.errorMessage
	};
}
function hasUsableAttachmentContext(attachments) {
	return attachments.some((attachment) => attachment.extractionStatus === "ready" && Boolean(attachment.extractedText));
}
//#endregion
//#region src/shared/components/agent-mode/mention-highlights-utils.ts
var EMPTY_MENTION_LABELS$1 = [];
function isBoundaryCharacter(value) {
	return !value || /[\s.,!?;:()[\]{}'"/\\|-]/.test(value);
}
function splitAgentTextWithMentions(text, mentionLabels = EMPTY_MENTION_LABELS$1) {
	if (!text) return [];
	const normalizedLabels = Array.from(new Set(mentionLabels.flatMap((label) => {
		const normalizedLabel = label.trim();
		return normalizedLabel ? [`@${normalizedLabel}`] : [];
	}))).sort((a, b) => b.length - a.length);
	const exactLabelByLowercase = new Map(normalizedLabels.map((label) => [label.toLowerCase(), label]));
	const segments = [];
	let buffer = "";
	let index = 0;
	const flushBuffer = () => {
		if (!buffer) return;
		segments.push({
			text: buffer,
			isMention: false
		});
		buffer = "";
	};
	while (index < text.length) {
		const currentChar = text[index];
		if (currentChar !== "@" || !isBoundaryCharacter(text[index - 1])) {
			buffer += currentChar;
			index += 1;
			continue;
		}
		const markupMatch = text.slice(index).match(/^@\[([^\]]+)\]/);
		if (markupMatch?.[0]) {
			flushBuffer();
			segments.push({
				text: `@${markupMatch[1]}`,
				isMention: true
			});
			index += markupMatch[0].length;
			continue;
		}
		let exactLabel;
		for (const [lowerLabel, label] of exactLabelByLowercase) if (text.slice(index, index + label.length).toLowerCase() === lowerLabel && isBoundaryCharacter(text[index + label.length])) {
			exactLabel = label;
			break;
		}
		if (exactLabel) {
			flushBuffer();
			segments.push({
				text: text.slice(index, index + exactLabel.length),
				isMention: true
			});
			index += exactLabel.length;
			continue;
		}
		const tokenMatch = text.slice(index).match(/^@[A-Za-z0-9._-]+/);
		if (tokenMatch?.[0]) {
			flushBuffer();
			segments.push({
				text: tokenMatch[0],
				isMention: true
			});
			index += tokenMatch[0].length;
			continue;
		}
		buffer += currentChar;
		index += 1;
	}
	flushBuffer();
	return segments;
}
//#endregion
//#region src/shared/components/agent-mode/mention-highlights.tsx
var EMPTY_MENTION_LABELS = [];
function AgentMentionPills({ mentions }) {
	if (mentions.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-2 flex flex-wrap gap-1.5",
		children: mentions.map((mention) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs text-primary",
			title: `${mention.type} · ${mention.id}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-medium",
					children: ["@", mention.name]
				}),
				mention.subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate text-[10px] text-muted-foreground",
					children: mention.subtitle
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded bg-background/80 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground",
					children: mention.type
				})
			]
		}, `${mention.type}:${mention.id}`))
	});
}
function AgentMentionText({ text, mentionLabels = EMPTY_MENTION_LABELS, className, mentionClassName }) {
	const segments = splitAgentTextWithMentions(text, mentionLabels);
	const occurrenceCounts = /* @__PURE__ */ new Map();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className,
		children: segments.map((segment) => {
			const occurrence = (occurrenceCounts.get(segment.text) ?? 0) + 1;
			occurrenceCounts.set(segment.text, occurrence);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: segment.isMention ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("inline rounded-md px-1.5 py-0.5 font-medium ring-1 ring-inset", "bg-accent/15 text-primary ring-primary/20", mentionClassName),
				children: segment.text
			}) : segment.text }, `${segment.text}-${occurrence}`);
		})
	});
}
//#endregion
export { useClientRelativeTime as _, agentAttachmentsToChatMedia as a, isFeatureEnabled as b, getPdfUploadSizeError as c, parseAgentAttachmentsFromStored as d, readFileAsBase64 as f, useClientNowMs as g, useClientNow as h, AGENT_ATTACHMENT_ACCEPT as i, hasUsableAttachmentContext as l, toAgentRequestAttachmentContext as m, AgentMentionText as n, buildAgentAttachmentContext as o, serializeAgentAttachmentsForStorage as p, splitAgentTextWithMentions as r, createPendingAttachmentPlaceholder as s, AgentMentionPills as t, hydrateAgentAttachmentUrls as u, NavigationProvider as v, useNavigationContext as y };
