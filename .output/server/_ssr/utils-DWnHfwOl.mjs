//#region node_modules/.nitro/vite/services/ssr/assets/utils-DWnHfwOl.js
/** Strip markdown/noise and clamp text for conversation list previews. */
function formatConversationSnippet(raw, maxLength = 96) {
	if (!raw?.trim()) return "";
	const text = raw.replace(/```[\s\S]*?```/g, "[code]").replace(/`([^`]+)`/g, "$1").replace(/!\[[^\]]*\]\([^)]+\)/g, "[image]").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
	if (!text) return "";
	if (text.length <= maxLength) return text;
	return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}
/** Contain long tokens inside chat bubbles and markdown bodies. */
var CHAT_MESSAGE_BODY_CLASS = "max-w-full min-w-0 overflow-hidden break-words [overflow-wrap:anywhere]";
var CHAT_MARKDOWN_CLASS = "max-w-full min-w-0 space-y-2 [&_a]:break-all [&_code]:break-all [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:max-w-full";
var CHAT_LIST_PREVIEW_CLASS = "min-w-0 flex-1 line-clamp-1 break-all text-xs text-muted-foreground";
var CHAT_CONVERSATION_ROW_CLASS = "flex w-full max-w-full min-w-0 items-center gap-3 overflow-hidden rounded-xl p-3 text-left";
var CHANNEL_TYPE_COLORS = {
	client: "bg-info/10 text-info",
	team: "bg-success/10 text-success",
	project: "bg-accent/10 text-accent"
};
var RELATIVE_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric"
});
new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	hour: "numeric",
	minute: "2-digit"
});
new Intl.DateTimeFormat("en-US", {
	weekday: "long",
	month: "long",
	day: "numeric"
});
function normalizeTeamMembers(members = []) {
	const map = /* @__PURE__ */ new Map();
	members.forEach((member) => {
		const name = typeof member.name === "string" ? member.name.trim() : "";
		if (!name) return;
		const role = typeof member.role === "string" ? member.role.trim() : "";
		const key = name.toLowerCase();
		if (!map.has(key)) map.set(key, {
			name,
			role: role || "Contributor"
		});
	});
	return Array.from(map.values());
}
function aggregateTeamMembers(clients, fallbackName, fallbackRole) {
	const map = /* @__PURE__ */ new Map();
	clients.forEach((client) => {
		normalizeTeamMembers(client.teamMembers).forEach((member) => {
			const key = member.name.toLowerCase();
			if (!map.has(key)) map.set(key, member);
		});
	});
	const normalizedFallback = fallbackName.trim();
	if (normalizedFallback.length > 0) {
		const key = normalizedFallback.toLowerCase();
		if (!map.has(key)) map.set(key, {
			name: normalizedFallback,
			role: fallbackRole
		});
	}
	return Array.from(map.values());
}
function getInitials(name) {
	const trimmed = name.trim();
	if (!trimmed) return "TM";
	const parts = trimmed.split(" ").filter(Boolean);
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}
function formatRelativeTime(value) {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	const diffMs = Date.now() - date.getTime();
	const diffSeconds = Math.floor(diffMs / 1e3);
	if (diffSeconds < 60) return `${diffSeconds}s ago`;
	const diffMinutes = Math.floor(diffSeconds / 60);
	if (diffMinutes < 60) return `${diffMinutes}m ago`;
	const diffHours = Math.floor(diffMinutes / 60);
	if (diffHours < 24) return `${diffHours}h ago`;
	const diffDays = Math.floor(diffHours / 24);
	if (diffDays < 7) return `${diffDays}d ago`;
	return RELATIVE_DATE_FORMATTER.format(date);
}
function collectSharedFiles(messages) {
	const map = /* @__PURE__ */ new Map();
	messages.forEach((list) => {
		list.forEach((attachment) => {
			if (!attachment?.url) return;
			const key = `${attachment.url}-${attachment.name}`;
			if (!map.has(key)) map.set(key, attachment);
		});
	});
	return Array.from(map.values());
}
var URL_REGEX = /https?:\/\/(?:www\.)?[\w\-._~:/?#\[\]@!$&'()*+,;=%]+/gi;
var IMAGE_EXTENSION_REGEX = /\.(?:png|jpe?g|gif|webp|svg|avif)$/i;
function extractUrlsFromContent(text) {
	if (!text) return [];
	const matches = text.match(URL_REGEX);
	if (!matches) return [];
	const unique = /* @__PURE__ */ new Set();
	matches.forEach((raw) => {
		try {
			const normalized = new URL(raw).toString();
			unique.add(normalized);
		} catch {}
	});
	return Array.from(unique);
}
function isLikelyImageUrl(url) {
	try {
		const parsed = new URL(url);
		if (!["http:", "https:"].includes(parsed.protocol)) return false;
		return IMAGE_EXTENSION_REGEX.test(parsed.pathname);
	} catch {
		return false;
	}
}
/**
* Builds a collaboration URL that opens this channel when shared (uses dashboard URL params).
*/
function buildCollaborationChannelShareUrl(channel) {
	if (typeof window === "undefined") return "";
	const url = new URL(window.location.href);
	url.searchParams.set("channelId", channel.id);
	url.searchParams.set("channelType", channel.type);
	if (channel.type === "client" && channel.clientId) url.searchParams.set("clientId", channel.clientId);
	else url.searchParams.delete("clientId");
	if (channel.type === "project" && channel.projectId) url.searchParams.set("projectId", channel.projectId);
	url.searchParams.delete("messageId");
	url.searchParams.delete("threadId");
	return url.toString();
}
/**
* Builds a collaboration URL that opens a direct message conversation when shared.
*/
function buildCollaborationDmShareUrl(conversationLegacyId) {
	if (typeof window === "undefined") return "";
	const url = new URL(window.location.href);
	url.searchParams.set("conversationId", conversationLegacyId);
	url.searchParams.delete("channelId");
	url.searchParams.delete("channelType");
	url.searchParams.delete("messageId");
	url.searchParams.delete("threadId");
	return url.toString();
}
//#endregion
export { CHAT_MESSAGE_BODY_CLASS as a, buildCollaborationDmShareUrl as c, formatConversationSnippet as d, formatRelativeTime as f, normalizeTeamMembers as h, CHAT_MARKDOWN_CLASS as i, collectSharedFiles as l, isLikelyImageUrl as m, CHAT_CONVERSATION_ROW_CLASS as n, aggregateTeamMembers as o, getInitials as p, CHAT_LIST_PREVIEW_CLASS as r, buildCollaborationChannelShareUrl as s, CHANNEL_TYPE_COLORS as t, extractUrlsFromContent as u };
