import { S as validateFile } from "./utils-hh4sibN0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-Dp3pETO6.js
var MAX_ATTACHMENT_SIZE = 15 * 1024 * 1024;
var ALLOWED_ATTACHMENT_EXTENSIONS = [
	"png",
	"jpg",
	"jpeg",
	"webp",
	"pdf",
	"doc",
	"docx",
	"ppt",
	"pptx",
	"xls",
	"xlsx",
	"csv",
	"txt",
	"zip",
	"md"
];
var ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
	"image/png",
	"image/jpeg",
	"image/jpg",
	"image/webp",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-powerpoint",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"text/plain",
	"text/csv",
	"text/markdown",
	"application/zip"
]);
var TYPING_TIMEOUT_MS = 8e3;
var COLLABORATION_REACTION_SET = new Set([
	"👍",
	"🎉",
	"❤️",
	"🚀",
	"👀",
	"😄"
]);
/**
* Format file size in human-readable format
*/
function formatFileSize(bytes) {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = [
		"B",
		"KB",
		"MB",
		"GB"
	];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
}
/**
* Validate a single attachment file
*/
function validateAttachment(file) {
	const validation = validateFile(file, {
		allowedTypes: Array.from(ALLOWED_ATTACHMENT_MIME_TYPES),
		maxSizeMb: MAX_ATTACHMENT_SIZE / (1024 * 1024)
	});
	if (!validation.valid) {
		const extension = file.name.toLowerCase().split(".").pop();
		if (extension && ALLOWED_ATTACHMENT_EXTENSIONS.includes(extension)) {
			if (file.size > 15728640) return `File size exceeds ${formatFileSize(MAX_ATTACHMENT_SIZE)} limit`;
			return null;
		}
		return validation.error || "File type not supported";
	}
	return null;
}
/**
* Validate multiple attachments and return valid ones with errors
*/
function validateAttachments(files, currentCount, maxAttachments) {
	const fileArray = Array.from(files);
	const valid = [];
	const errors = [];
	if (currentCount + fileArray.length > maxAttachments) {
		errors.push(`Maximum ${maxAttachments} attachments allowed per message`);
		return {
			valid,
			errors
		};
	}
	fileArray.forEach((file) => {
		const error = validateAttachment(file);
		if (error) errors.push(`${file.name}: ${error}`);
		else valid.push({
			id: `${Date.now()}-${Math.random()}`,
			file,
			name: file.name,
			sizeLabel: formatFileSize(file.size),
			mimeType: file.type
		});
	});
	return {
		valid,
		errors
	};
}
//#endregion
export { TYPING_TIMEOUT_MS as n, validateAttachments as r, COLLABORATION_REACTION_SET as t };
