import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as uploadStorageFile } from "./upload-storage-file-CUAnugSD.mjs";
import { r as buildAgentAttachmentContext } from "./agent-attachments-Bv_PBE19.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/upload-import-document-BMFT4cyE.js
var import_jsx_runtime = require_jsx_runtime();
function buildProjectRoute(projectId, projectName) {
	const params = new URLSearchParams({ projectId });
	if (projectName) params.set("projectName", projectName);
	return `/dashboard/projects?${params.toString()}`;
}
function buildProjectTasksRoute(options) {
	const params = new URLSearchParams({ projectId: options.projectId });
	if (options.projectName) params.set("projectName", options.projectName);
	if (options.clientId) params.set("clientId", options.clientId);
	if (options.clientName) params.set("clientName", options.clientName);
	if (options.action) params.set("action", options.action);
	return `/dashboard/tasks?${params.toString()}`;
}
var SIZE_THRESHOLD_SMALL = 50;
var SIZE_THRESHOLD_TINY = 30;
var SIZE_THRESHOLD_MEDIUM = 100;
var BLUR_MULTIPLIER_SMALL = .008;
var BLUR_MIN_SMALL = 1;
var BLUR_MULTIPLIER_LARGE = .015;
var BLUR_MIN_LARGE = 4;
var CONTRAST_MULTIPLIER_SMALL = .004;
var CONTRAST_MIN_SMALL = 1.2;
var CONTRAST_MULTIPLIER_LARGE = .008;
var CONTRAST_MIN_LARGE = 1.5;
var DOT_SIZE_MULTIPLIER_SMALL = .004;
var DOT_SIZE_MIN_SMALL = .05;
var DOT_SIZE_MULTIPLIER_LARGE = .008;
var DOT_SIZE_MIN_LARGE = .1;
var SHADOW_MULTIPLIER_SMALL = .004;
var SHADOW_MIN_SMALL = .5;
var SHADOW_MULTIPLIER_LARGE = .008;
var SHADOW_MIN_LARGE = 2;
var MASK_RADIUS_TINY = "0%";
var MASK_RADIUS_SMALL = "5%";
var MASK_RADIUS_MEDIUM = "15%";
var MASK_RADIUS_LARGE = "25%";
var CONTRAST_TINY = 1.1;
var CONTRAST_MULTIPLIER_FINAL = 1.2;
var CONTRAST_MIN_FINAL = 1.3;
var DEFAULT_SIRI_ORB_COLORS = {
	bg: "var(--background)",
	c1: "var(--chart-5)",
	c2: "var(--chart-2)",
	c3: "var(--chart-1)"
};
function SiriOrb({ size = "192px", className, colors, animationDuration = 20 }) {
	const finalColors = {
		...DEFAULT_SIRI_ORB_COLORS,
		...colors
	};
	const sizeValue = Number.parseInt(size.replace("px", ""), 10);
	const blurAmount = sizeValue < SIZE_THRESHOLD_SMALL ? Math.max(sizeValue * BLUR_MULTIPLIER_SMALL, BLUR_MIN_SMALL) : Math.max(sizeValue * BLUR_MULTIPLIER_LARGE, BLUR_MIN_LARGE);
	const contrastAmount = sizeValue < SIZE_THRESHOLD_SMALL ? Math.max(sizeValue * CONTRAST_MULTIPLIER_SMALL, CONTRAST_MIN_SMALL) : Math.max(sizeValue * CONTRAST_MULTIPLIER_LARGE, CONTRAST_MIN_LARGE);
	const dotSize = sizeValue < SIZE_THRESHOLD_SMALL ? Math.max(sizeValue * DOT_SIZE_MULTIPLIER_SMALL, DOT_SIZE_MIN_SMALL) : Math.max(sizeValue * DOT_SIZE_MULTIPLIER_LARGE, DOT_SIZE_MIN_LARGE);
	const shadowSpread = sizeValue < SIZE_THRESHOLD_SMALL ? Math.max(sizeValue * SHADOW_MULTIPLIER_SMALL, SHADOW_MIN_SMALL) : Math.max(sizeValue * SHADOW_MULTIPLIER_LARGE, SHADOW_MIN_LARGE);
	const getMaskRadius = (value) => {
		if (value < SIZE_THRESHOLD_TINY) return MASK_RADIUS_TINY;
		if (value < SIZE_THRESHOLD_SMALL) return MASK_RADIUS_SMALL;
		if (value < SIZE_THRESHOLD_MEDIUM) return MASK_RADIUS_MEDIUM;
		return MASK_RADIUS_LARGE;
	};
	const maskRadius = getMaskRadius(sizeValue);
	const getFinalContrast = (value) => {
		if (value < SIZE_THRESHOLD_TINY) return CONTRAST_TINY;
		if (value < SIZE_THRESHOLD_SMALL) return Math.max(contrastAmount * CONTRAST_MULTIPLIER_FINAL, CONTRAST_MIN_FINAL);
		return contrastAmount;
	};
	const finalContrast = getFinalContrast(sizeValue);
	const orbStyle = {
		width: size,
		height: size,
		"--bg": finalColors.bg,
		"--c1": finalColors.c1,
		"--c2": finalColors.c2,
		"--c3": finalColors.c3,
		"--animation-duration": `${animationDuration}s`,
		"--blur-amount": `${blurAmount}px`,
		"--contrast-amount": finalContrast,
		"--dot-size": `${dotSize}px`,
		"--shadow-spread": `${shadowSpread}px`,
		"--mask-radius": maskRadius
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("siri-orb", className),
		style: orbStyle,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
        @property --angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        .siri-orb {
          display: grid;
          grid-template-areas: "stack";
          overflow: hidden;
          border-radius: 50%;
          position: relative;
        }

        .siri-orb::before,
        .siri-orb::after {
          content: "";
          display: block;
          grid-area: stack;
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }

        .siri-orb::before {
          background:
            conic-gradient(
              from calc(var(--angle) * 2) at 25% 70%,
              var(--c3),
              transparent 20% 80%,
              var(--c3)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 45% 75%,
              var(--c2),
              transparent 30% 60%,
              var(--c2)
            ),
            conic-gradient(
              from calc(var(--angle) * -3) at 80% 20%,
              var(--c1),
              transparent 40% 60%,
              var(--c1)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 15% 5%,
              var(--c2),
              transparent 10% 90%,
              var(--c2)
            ),
            conic-gradient(
              from calc(var(--angle) * 1) at 20% 80%,
              var(--c1),
              transparent 10% 90%,
              var(--c1)
            ),
            conic-gradient(
              from calc(var(--angle) * -2) at 85% 10%,
              var(--c3),
              transparent 20% 80%,
              var(--c3)
            );
          box-shadow: inset var(--bg) 0 0 var(--shadow-spread)
            calc(var(--shadow-spread) * 0.2);
          filter: blur(var(--blur-amount)) contrast(var(--contrast-amount));
          animation: rotate var(--animation-duration) linear infinite;
        }

        .siri-orb::after {
          background-image: radial-gradient(
            circle at center,
            var(--bg) var(--dot-size),
            transparent var(--dot-size)
          );
          background-size: calc(var(--dot-size) * 2) calc(var(--dot-size) * 2);
          backdrop-filter: blur(calc(var(--blur-amount) * 2))
            contrast(calc(var(--contrast-amount) * 2));
          mix-blend-mode: overlay;
        }

        .siri-orb[style*="--mask-radius: 0%"]::after {
          mask-image: none;
        }

        .siri-orb:not([style*="--mask-radius: 0%"])::after {
          mask-image: radial-gradient(
            black var(--mask-radius),
            transparent 75%
          );
        }

        @keyframes rotate {
          to {
            --angle: 360deg;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .siri-orb::before {
            animation: none;
          }
        }
      ` })
	});
}
var TASKS_DOCUMENT_EXTENSIONS = new Set([
	"pdf",
	"doc",
	"docx"
]);
var TASKS_VISUAL_EXTENSIONS = new Set([
	"png",
	"jpg",
	"jpeg",
	"webp",
	"heic",
	"heif"
]);
var TASKS_DOCUMENT_MIME_TYPES = new Set([
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);
var TASKS_VISUAL_MIME_TYPES = new Set([
	"image/png",
	"image/jpeg",
	"image/jpg",
	"image/webp",
	"image/heic",
	"image/heif"
]);
function getFileExtension(fileName) {
	return fileName.split(".").pop()?.toLowerCase() ?? "";
}
function resolveTasksDocumentMimeType(file) {
	if (file.type) return file.type;
	const extension = getFileExtension(file.name);
	if (extension === "pdf") return "application/pdf";
	if (extension === "doc") return "application/msword";
	if (extension === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
	if (extension === "png") return "image/png";
	if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
	if (extension === "webp") return "image/webp";
	if (extension === "heic") return "image/heic";
	if (extension === "heif") return "image/heif";
	return "application/octet-stream";
}
function isTasksVisualDocumentFile(file) {
	const extension = getFileExtension(file.name);
	if (TASKS_VISUAL_EXTENSIONS.has(extension)) return true;
	return TASKS_VISUAL_MIME_TYPES.has(file.type);
}
function isTasksDocumentFile(file) {
	if (isTasksVisualDocumentFile(file)) return true;
	const extension = getFileExtension(file.name);
	if (TASKS_DOCUMENT_EXTENSIONS.has(extension)) return true;
	return TASKS_DOCUMENT_MIME_TYPES.has(file.type);
}
function filterTasksDocumentFiles(files) {
	return Array.from(files).filter(isTasksDocumentFile);
}
function isFileDragEvent(event) {
	return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}
function isPdfFile(file) {
	const extension = getFileExtension(file.name);
	const mimeType = resolveTasksDocumentMimeType(file);
	return extension === "pdf" || mimeType === "application/pdf";
}
function shouldUseVisionImport(file, extracted) {
	if (isTasksVisualDocumentFile(file)) return true;
	if (!isPdfFile(file)) return false;
	if (extracted.extractionStatus === "ready" && extracted.extractedText?.trim()) return false;
	return true;
}
async function prepareTaskImportDocument(file, options) {
	if (isTasksVisualDocumentFile(file)) {
		const storageId = await options.uploadForVision(file);
		return {
			kind: "vision",
			fileName: file.name,
			mimeType: resolveTasksDocumentMimeType(file),
			storageId
		};
	}
	const extracted = await buildAgentAttachmentContext(file, options);
	if (extracted.extractionStatus === "failed") {
		const isLegacyDoc = file.name.toLowerCase().endsWith(".doc");
		throw new Error(extracted.errorMessage ?? (isLegacyDoc ? "Legacy .doc files are not supported. Save as .docx and try again." : "Could not read this document."));
	}
	if (shouldUseVisionImport(file, extracted)) {
		const storageId = await options.uploadForVision(file);
		return {
			kind: "vision",
			fileName: file.name,
			mimeType: resolveTasksDocumentMimeType(file),
			storageId
		};
	}
	const text = extracted.extractedText?.trim();
	if (!text) throw new Error("Could not read any text from this document.");
	return {
		kind: "text",
		fileName: file.name,
		text
	};
}
function combineExtractedDocumentText(documents) {
	return documents.map((document, index) => `--- Document ${index + 1}: ${document.fileName} ---\n${document.text}`).join("\n\n");
}
function buildTaskImportFileName(files) {
	if (files.length === 1) return files[0]?.name ?? "document";
	return `${files.length} documents`;
}
var MAX_TASK_IMPORT_BYTES = 15 * 1024 * 1024;
async function uploadTaskImportDocument(args) {
	const { file, generateUploadUrl, syncMetadata } = args;
	if (file.size > MAX_TASK_IMPORT_BYTES) throw new Error("File is too large for import (max 15 MB).");
	return uploadStorageFile({
		file,
		contentType: file.type || "application/octet-stream",
		generateUploadUrl,
		syncMetadata
	});
}
//#endregion
export { combineExtractedDocumentText as a, prepareTaskImportDocument as c, buildTaskImportFileName as i, uploadTaskImportDocument as l, buildProjectRoute as n, filterTasksDocumentFiles as o, buildProjectTasksRoute as r, isFileDragEvent as s, SiriOrb as t };
