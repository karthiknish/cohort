import { o as __toESM } from "../_runtime.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agent-attachments-Bv_PBE19.js
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
	const { default: JSZip } = await import("../_libs/exceljs+[...].mjs").then((n) => /* @__PURE__ */ __toESM(n.n()));
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
export { getPdfUploadSizeError as a, parseAgentAttachmentsFromStored as c, toAgentRequestAttachmentContext as d, createPendingAttachmentPlaceholder as i, readFileAsBase64 as l, agentAttachmentsToChatMedia as n, hasUsableAttachmentContext as o, buildAgentAttachmentContext as r, hydrateAgentAttachmentUrls as s, AGENT_ATTACHMENT_ACCEPT as t, serializeAgentAttachmentsForStorage as u };
