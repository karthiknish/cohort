import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { An as FileText, Rn as ExternalLink, Ur as ArrowLeft, Vn as Download, Yt as LoaderCircle, ct as Presentation } from "../_libs/lucide-react.mjs";
import { t as dynamic } from "./dynamic-D6gKSsRx.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/deck-document-viewer-DYOkkoJk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function getFileNameFromUrl(src) {
	const segments = ((src.split("?")[0] ?? "").split("#")[0] ?? "").split("/").filter(Boolean);
	const lastSegment = segments[segments.length - 1];
	if (typeof lastSegment === "string" && lastSegment.includes(".")) return lastSegment;
	return "presentation";
}
function getDocumentKind(fileName) {
	const lower = fileName.toLowerCase();
	if (lower.endsWith(".pdf")) return "pdf";
	if (lower.endsWith(".pptx") || lower.endsWith(".ppt")) return "pptx";
	return "unknown";
}
function documentKindLabel(kind) {
	switch (kind) {
		case "pdf": return "PDF";
		case "pptx": return "PowerPoint";
		default: return "Document";
	}
}
function PdfViewer({ url, title = "PDF document", className }) {
	const [isLoading, setIsLoading] = (0, import_react.useState)(true);
	const [loadError, setLoadError] = (0, import_react.useState)(false);
	const handleLoad = () => {
		setIsLoading(false);
		setLoadError(false);
	};
	const handleError = () => {
		setIsLoading(false);
		setLoadError(true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex min-h-0 flex-1 flex-col", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative min-h-[min(72dvh,720px)] flex-1 overflow-hidden rounded-xl border border-border/60 bg-foreground shadow-inner ring-1 ring-border/40",
			children: [
				isLoading && !loadError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-foreground/90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "size-8 animate-spin text-viewer-chrome/70",
						"aria-hidden": true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-viewer-chrome/60",
						children: "Loading PDF…"
					})]
				}) : null,
				loadError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 p-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
							className: "size-10 text-viewer-chrome/50",
							"aria-hidden": true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium text-viewer-chrome",
								children: "Preview unavailable in browser"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "max-w-sm text-sm text-viewer-chrome/60",
								children: "Open the file in a new tab or download it to view this PDF."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap justify-center gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								size: "sm",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: url,
									target: "_blank",
									rel: "noreferrer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "mr-2 size-4" }), "Open in new tab"]
								})
							})
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
					src: url,
					title,
					sandbox: "",
					className: "h-full min-h-[min(72dvh,720px)] w-full bg-foreground",
					onLoad: handleLoad,
					onError: handleError
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-center text-xs text-muted-foreground",
			children: "Use your browser's PDF controls to zoom and navigate pages."
		})]
	});
}
var PptViewer = dynamic(() => import("./ppt-viewer-DEbKud_y.mjs").then((m) => ({ default: m.PptViewer })), {
	loading: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewerLoadingState, { label: "Loading slides…" }),
	ssr: false
});
function ViewerLoadingState({ label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-[min(60dvh,560px)] flex-1 items-center justify-center rounded-xl border border-border/60 bg-black/80",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-3 text-viewer-chrome/70",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
				className: "size-8 animate-spin",
				"aria-hidden": true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: label
			})]
		})
	});
}
function FormatIcon({ kind }) {
	if (kind === "pdf") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
		className: "size-4 shrink-0 text-primary",
		"aria-hidden": true
	});
	if (kind === "pptx") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Presentation, {
		className: "size-4 shrink-0 text-primary",
		"aria-hidden": true
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
		className: "size-4 shrink-0 text-muted-foreground",
		"aria-hidden": true
	});
}
function DeckDocumentViewer({ src, fileName: fileNameProp, backHref = "/dashboard/proposals", backLabel = "Back to proposals", subtitle, embedded = false, className }) {
	const fileName = fileNameProp ?? getFileNameFromUrl(src);
	const kind = getDocumentKind(fileName);
	const displayTitle = (() => {
		const base = fileName.replace(/\.(pdf|pptx?)$/i, "").replace(/[-_]/g, " ");
		return base.length > 0 ? base : "Presentation";
	})();
	const toolbar = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex shrink-0 flex-wrap items-center gap-2 sm:justify-end",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			size: "sm",
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: src,
				target: "_blank",
				rel: "noreferrer",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "mr-2 size-4" }), "Open file"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "sm",
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: src,
				download: fileName,
				target: "_blank",
				rel: "noreferrer",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 size-4" }), "Download"]
			})
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col gap-4", embedded ? "min-h-0" : "min-h-[calc(100dvh-10rem)]", className),
		children: [embedded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormatIcon, { kind }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate text-sm font-semibold text-foreground",
						children: displayTitle
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: "shrink-0 font-mono text-[10px] uppercase tracking-wider",
						children: documentKindLabel(kind)
					})
				]
			}), toolbar]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/80 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					className: "mt-0.5 shrink-0",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
						href: backHref,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "mr-2 size-4" }), backLabel]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 border-l border-border/60 pl-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormatIcon, { kind }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "truncate text-lg font-semibold tracking-tight text-foreground",
									children: displayTitle
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "shrink-0 font-mono text-[10px] uppercase tracking-wider",
									children: documentKindLabel(kind)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 truncate text-xs text-muted-foreground",
							children: fileName
						}),
						subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: subtitle
						}) : null
					]
				})]
			}), toolbar]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-h-0 flex-1 flex-col",
			children: kind === "pdf" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PdfViewer, {
				url: src,
				title: displayTitle,
				className: "flex-1"
			}) : kind === "pptx" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PptViewer, {
				url: src,
				title: displayTitle,
				className: "flex-1"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/70 bg-muted/20 p-10 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "This file type cannot be previewed in the browser."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: src,
						target: "_blank",
						rel: "noreferrer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 size-4" }), "Download file"]
					})
				})]
			})
		})]
	});
}
//#endregion
export { DeckDocumentViewer as t };
