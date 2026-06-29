import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mention-highlights-C5eBIzIc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
export { AgentMentionText as n, splitAgentTextWithMentions as r, AgentMentionPills as t };
