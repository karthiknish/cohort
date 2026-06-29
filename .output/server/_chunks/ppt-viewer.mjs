import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { Pt as Minimize2, Q as RotateCcw, Vn as Download, Wt as Maximize2, Yt as LoaderCircle, cr as CircleAlert, mr as ChevronLeft, pr as ChevronRight } from "../_libs/lucide-react.mjs";
import { n as require_lib } from "../_libs/exceljs+[...].mjs";
import { t as cn } from "./utils.mjs";
import { t as Button } from "./button.mjs";
import { t as Image } from "./image.mjs";
//#region src/shared/components/ppt-viewer-sections.tsx
var import_jsx_runtime = require_jsx_runtime();
function PptViewerLoading({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex min-h-[min(60dvh,560px)] flex-1 items-center justify-center rounded-xl border border-border/60 bg-foreground", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-4 text-viewer-chrome/70",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
				className: "size-9 animate-spin",
				"aria-hidden": true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-viewer-chrome/90",
					children: "Extracting slides"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-viewer-chrome/50",
					children: "This may take a few seconds for large decks"
				})]
			})]
		})
	});
}
function PptViewerError({ className, error, url, onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex min-h-[min(40dvh,400px)] flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-10", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
				className: "size-10 text-destructive",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-md text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium text-foreground",
					children: "Unable to load presentation"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: error
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap justify-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: onRetry,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "mr-2 size-4" }), "Try again"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					size: "sm",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: url,
						target: "_blank",
						rel: "noreferrer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 size-4" }), "Download file"]
					})
				})]
			})
		]
	});
}
function PptViewerThumbnailButton({ slide, index, currentSlide, onGoToSlide, "aria-label": ariaLabel }) {
	const onSelectSlideThumbnail = () => {
		onGoToSlide(index);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		role: "tab",
		onClick: onSelectSlideThumbnail,
		"aria-label": ariaLabel,
		"aria-selected": index === currentSlide,
		className: cn("flex-shrink-0 overflow-hidden rounded-lg border-2 motion-chromatic transition-[border-color,box-shadow,opacity]", index === currentSlide ? "border-primary shadow-md shadow-primary/20 ring-2 ring-primary/25" : "border-transparent opacity-70 hover:border-muted-foreground/30 hover:opacity-100"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative h-14 w-24 bg-foreground/90 sm:h-16 sm:w-28",
			children: slide.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
				src: slide.imageUrl,
				alt: "",
				fill: true,
				unoptimized: true,
				sizes: "112px",
				className: "object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex size-full items-center justify-center text-xs font-medium tabular-nums text-viewer-chrome/60",
				children: index + 1
			})
		})
	});
}
function PptViewerCanvas({ title, slides, currentSlide, isFullscreen, onPrevSlide, onNextSlide, onToggleFullscreen }) {
	const currentSlideData = slides[currentSlide];
	const hasMultiple = slides.length > 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative aspect-video w-full max-h-[min(72dvh,720px)] overflow-hidden rounded-xl border border-border/60 bg-foreground shadow-inner ring-1 ring-white/5",
		children: [
			currentSlideData?.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
				src: currentSlideData.imageUrl,
				alt: `${title} — slide ${currentSlide + 1}`,
				fill: true,
				unoptimized: true,
				sizes: isFullscreen ? "100vw" : "(max-width: 1280px) 90vw",
				className: "object-contain",
				priority: currentSlide === 0
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-full min-h-[280px] w-full items-center justify-center bg-gradient-to-b from-foreground/90 to-foreground p-8 sm:min-h-[360px]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-lg text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium uppercase tracking-widest text-viewer-chrome/40",
						children: ["Slide ", currentSlide + 1]
					}), currentSlideData?.textContent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-base leading-relaxed text-viewer-chrome/85",
						children: currentSlideData.textContent
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-viewer-chrome/50",
						children: "No preview image for this slide"
					})]
				})
			}),
			hasMultiple ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				className: "absolute left-3 top-1/2 z-10 size-11 -translate-y-1/2 rounded-full border border-white/10 bg-black/55 text-viewer-chrome shadow-lg backdrop-blur-sm hover:bg-black/75 disabled:opacity-25",
				onClick: onPrevSlide,
				disabled: currentSlide === 0,
				"aria-label": "Previous slide",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
					className: "size-6",
					"aria-hidden": true
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				className: "absolute right-3 top-1/2 z-10 size-11 -translate-y-1/2 rounded-full border border-white/10 bg-black/55 text-viewer-chrome shadow-lg backdrop-blur-sm hover:bg-black/75 disabled:opacity-25",
				onClick: onNextSlide,
				disabled: currentSlide === slides.length - 1,
				"aria-label": "Next slide",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
					className: "size-6",
					"aria-hidden": true
				})
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent px-3 pb-8 pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-md bg-black/50 px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-viewer-chrome/80 backdrop-blur-sm",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: "pointer-events-auto size-9 rounded-full border border-white/10 bg-black/50 text-viewer-chrome hover:bg-black/70",
					onClick: onToggleFullscreen,
					"aria-label": isFullscreen ? "Exit full screen" : "Enter full screen",
					children: isFullscreen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize2, {
						className: "size-4",
						"aria-hidden": true
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, {
						className: "size-4",
						"aria-hidden": true
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/65 px-4 py-1.5 text-sm font-medium tabular-nums text-viewer-chrome shadow-lg backdrop-blur-sm",
				"aria-live": "polite",
				children: [
					currentSlide + 1,
					" / ",
					slides.length
				]
			})
		]
	});
}
function PptViewerFilmstrip({ slides, currentSlide, onGoToSlide }) {
	if (slides.length <= 1) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto px-1 pb-1 pt-0.5 scroll-smooth",
				role: "tablist",
				"aria-label": "Slide thumbnails",
				children: slides.map((slide, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PptViewerThumbnailButton, {
					index,
					currentSlide,
					onGoToSlide,
					slide,
					"aria-label": index === currentSlide ? `Currently viewing slide ${index + 1}` : `Go to slide ${index + 1}`
				}, slide.index))
			})
		]
	});
}
//#endregion
//#region src/shared/components/ppt-viewer-types.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_lib = /* @__PURE__ */ __toESM(require_lib(), 1);
function createInitialPptViewerState() {
	return {
		slides: [],
		currentSlide: 0,
		isLoading: true,
		error: null,
		isFullscreen: false
	};
}
function pptViewerReducer(state, action) {
	switch (action.type) {
		case "beginLoad": return {
			...state,
			isLoading: true,
			error: null,
			slides: [],
			currentSlide: 0
		};
		case "loadResolved": return {
			...state,
			isLoading: false,
			slides: action.slides,
			currentSlide: 0,
			error: action.error ?? null
		};
		case "setCurrentSlide": return {
			...state,
			currentSlide: action.value
		};
		case "toggleFullscreen": return {
			...state,
			isFullscreen: !state.isFullscreen
		};
		case "setFullscreen": return {
			...state,
			isFullscreen: action.value
		};
		default: return state;
	}
}
//#endregion
//#region src/shared/components/use-ppt-viewer.ts
function usePptViewer({ url }) {
	const [state, dispatch] = (0, import_react.useReducer)(pptViewerReducer, void 0, createInitialPptViewerState);
	const { slides, currentSlide, isLoading, error, isFullscreen } = state;
	const loadRequestRef = (0, import_react.useRef)(0);
	const extractSlides = async (arrayBuffer) => {
		const zip = await import_lib.default.loadAsync(arrayBuffer);
		const extractedSlides = [];
		const slideFiles = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name)).sort((a, b) => {
			return parseInt(a.match(/slide(\d+)/)?.[1] || "0", 10) - parseInt(b.match(/slide(\d+)/)?.[1] || "0", 10);
		});
		const mediaFiles = {};
		const mediaEntries = Object.entries(zip.files).filter(([name]) => name.startsWith("ppt/media/"));
		await Promise.all(mediaEntries.map(async ([name, file]) => {
			const blob = await file.async("blob").catch(() => null);
			if (blob) mediaFiles[name] = URL.createObjectURL(blob);
		}));
		const mediaValues = Object.values(mediaFiles);
		const parsedSlides = await Promise.all(slideFiles.map(async (slideFile, i) => {
			if (!slideFile) return null;
			const slideNum = parseInt(slideFile.match(/slide(\d+)/)?.[1] || "0", 10);
			let imageUrl = null;
			let textContent = "";
			const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
			const relsFile = zip.files[relsPath];
			if (relsFile) {
				const relsContent = await relsFile.async("text").catch(() => null);
				if (relsContent) {
					const imageMatch = relsContent.match(/Target="\.\.\/media\/(image\d+\.[^"]+)"/);
					if (imageMatch) imageUrl = mediaFiles[`ppt/media/${imageMatch[1]}`] || null;
				}
			}
			const slideFileEntry = zip.files[slideFile];
			if (slideFileEntry) {
				const slideContent = await slideFileEntry.async("text").catch(() => null);
				if (slideContent) {
					const textMatches = slideContent.match(/<a:t>([^<]*)<\/a:t>/g);
					if (textMatches) textContent = textMatches.flatMap((match) => {
						const text = match?.replace(/<\/?a:t>/g, "") ?? "";
						return text.trim() ? [text] : [];
					}).join(" ");
				}
			}
			if (!imageUrl && mediaValues.length > 0 && mediaValues[i]) imageUrl = mediaValues[i] ?? null;
			return {
				index: i,
				imageUrl,
				textContent: textContent.slice(0, 500)
			};
		}));
		extractedSlides.push(...parsedSlides.filter((slide) => slide !== null));
		return extractedSlides;
	};
	const fetchPresentation = async (fileUrl) => {
		const proxyUrl = `/api/proxy/file?url=${encodeURIComponent(fileUrl)}`;
		const response = await fetch(proxyUrl, {
			method: "GET",
			credentials: "include"
		});
		if (!response.ok) {
			if (response.status === 401 || response.status === 403) throw new Error("Access denied. You may not have permission to view this file.");
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.error || `Failed to fetch presentation: ${response.status}`);
		}
		return response.arrayBuffer();
	};
	const loadPresentation = (0, import_react.useEffectEvent)(() => {
		const requestId = loadRequestRef.current + 1;
		loadRequestRef.current = requestId;
		dispatch({ type: "beginLoad" });
		fetchPresentation(url).then((arrayBuffer) => {
			if (loadRequestRef.current !== requestId) return null;
			return extractSlides(arrayBuffer);
		}).then((extractedSlides) => {
			if (loadRequestRef.current !== requestId || !extractedSlides) return;
			if (extractedSlides.length === 0) throw new Error("No slides found in presentation");
			dispatch({
				type: "loadResolved",
				slides: extractedSlides
			});
		}).catch((err) => {
			if (loadRequestRef.current !== requestId) return;
			dispatch({
				type: "loadResolved",
				slides: [],
				error: err instanceof Error ? err.message : "Failed to load presentation"
			});
		});
	});
	(0, import_react.useEffect)(() => {
		loadPresentation();
	}, [url]);
	(0, import_react.useEffect)(() => {
		return () => {
			slides.forEach((slide) => {
				if (slide.imageUrl) URL.revokeObjectURL(slide.imageUrl);
			});
		};
	}, [slides]);
	const goToSlide = (0, import_react.useEffectEvent)((index) => {
		if (index >= 0 && index < slides.length) dispatch({
			type: "setCurrentSlide",
			value: index
		});
	});
	const handlePrevSlide = () => {
		goToSlide(currentSlide - 1);
	};
	const handleNextSlide = () => {
		goToSlide(currentSlide + 1);
	};
	const handleToggleFullscreen = () => {
		dispatch({ type: "toggleFullscreen" });
	};
	const handleKeyDownRef = (0, import_react.useRef)(() => {});
	(0, import_react.useEffect)(() => {
		handleKeyDownRef.current = (e) => {
			if (e.key === "ArrowLeft") goToSlide(currentSlide - 1);
			else if (e.key === "ArrowRight") goToSlide(currentSlide + 1);
			else if (e.key === "Home") goToSlide(0);
			else if (e.key === "End") goToSlide(slides.length - 1);
			else if (e.key === "Escape" && isFullscreen) dispatch({
				type: "setFullscreen",
				value: false
			});
		};
	}, [
		currentSlide,
		isFullscreen,
		slides.length
	]);
	(0, import_react.useEffect)(() => {
		const onKeyDown = (e) => {
			handleKeyDownRef.current(e);
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);
	const handleRetry = () => {
		loadPresentation();
	};
	return {
		slides,
		currentSlide,
		isLoading,
		error,
		isFullscreen,
		goToSlide,
		handlePrevSlide,
		handleNextSlide,
		handleToggleFullscreen,
		handleRetry
	};
}
//#endregion
//#region src/shared/components/ppt-viewer.tsx
function PptViewer({ url, className, title = "Presentation" }) {
	const { slides, currentSlide, isLoading, error, isFullscreen, goToSlide, handlePrevSlide, handleNextSlide, handleToggleFullscreen, handleRetry } = usePptViewer({ url });
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PptViewerLoading, { className });
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PptViewerError, {
		className,
		error,
		url,
		onRetry: handleRetry
	});
	const viewerBody = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex min-h-0 flex-1 flex-col", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PptViewerCanvas, {
				title,
				slides,
				currentSlide,
				isFullscreen,
				onPrevSlide: handlePrevSlide,
				onNextSlide: handleNextSlide,
				onToggleFullscreen: handleToggleFullscreen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PptViewerFilmstrip, {
				slides,
				currentSlide,
				onGoToSlide: goToSlide
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-center text-xs text-muted-foreground",
				children: "Arrow keys to navigate · Home / End for first and last slide"
			})
		]
	});
	if (isFullscreen) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dialog", {
		open: true,
		className: "fixed inset-0 z-[100] m-0 flex max-h-none w-full max-w-none flex-col border-0 bg-black/95 p-4 sm:p-8",
		"aria-label": `${title} full screen`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto flex size-full max-w-6xl flex-col justify-center",
			children: viewerBody
		})
	});
	return viewerBody;
}
//#endregion
export { PptViewer };
