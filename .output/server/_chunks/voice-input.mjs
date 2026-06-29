import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { i as m, o as LazyMotion, r as domAnimation } from "../_libs/framer-motion.mjs";
import { f as Overlay, h as Title, m as Root, p as Portal, u as Content } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { An as FileText, Dn as File$1, En as Film, Et as Music2, F as Sparkles, It as Mic, Lt as MicOff, Mn as FileSpreadsheet, Mt as MonitorPlay, Pn as FileArchive, Rn as ExternalLink, Vn as Download, fn as Image, i as X, mr as ChevronLeft, n as ZoomIn, pr as ChevronRight, t as ZoomOut } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils.mjs";
import { C as motionEasing, S as motionDurationSeconds, y as interactiveTransitionClass } from "./motion.mjs";
import { t as Badge } from "./badge.mjs";
import { t as Button } from "./button.mjs";
import { i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog.mjs";
import { t as Image$1 } from "./image.mjs";
//#region src/lib/upload-storage-file.ts
async function uploadWithProgress(url, file, onProgress) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open("PUT", url);
		xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
		if (onProgress) xhr.upload.onprogress = (event) => {
			onProgress({
				loaded: event.loaded,
				total: event.total
			});
		};
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) resolve();
			else reject(/* @__PURE__ */ new Error(`Failed to upload file: ${xhr.statusText}`));
		};
		xhr.onerror = () => reject(/* @__PURE__ */ new Error("Failed to upload file"));
		xhr.send(file);
	});
}
/**
* Upload a file to Cloudflare R2 via Convex signed URLs.
* Returns the persisted object reference (`r2:<key>`) stored in existing `storageId` fields.
*/
async function uploadStorageFile({ file, contentType, generateUploadUrl, syncMetadata, onProgress }) {
	const payload = await generateUploadUrl();
	const uploadUrl = payload.url?.trim();
	const key = payload.key?.trim();
	if (!uploadUrl || !key) throw new Error("Unable to create upload URL");
	await uploadWithProgress(uploadUrl, file instanceof File ? file : new File([file], "upload", { type: contentType || "application/octet-stream" }), onProgress);
	const trimmedStorageId = payload.storageId?.trim();
	if (trimmedStorageId) return trimmedStorageId;
	await syncMetadata({ key });
	return `r2:${key}`;
}
/**
* Upload to R2 and resolve a signed download URL for immediate UI use (chat previews, etc.).
*/
async function uploadStorageFileWithPublicUrl({ getPublicUrl, ...uploadOptions }) {
	const storageId = await uploadStorageFile(uploadOptions);
	const publicUrl = await getPublicUrl({ storageId });
	if (!publicUrl?.url) throw new Error("Unable to resolve uploaded file URL");
	return {
		storageId,
		url: publicUrl.url
	};
}
//#endregion
//#region src/shared/ui/lazy-image.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function LazyImage({ src, alt = "", className, onLoad, onError, ...rest }) {
	const [loadedSrc, setLoadedSrc] = (0, import_react.useState)(null);
	const objectUrl = (() => {
		if (src instanceof Blob) return URL.createObjectURL(src);
		return null;
	})();
	(0, import_react.useEffect)(() => {
		return () => {
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [objectUrl]);
	const resolvedSrc = src instanceof Blob ? objectUrl : src;
	const isLoaded = typeof resolvedSrc === "string" && loadedSrc === resolvedSrc;
	const handleLoad = (event) => {
		if (typeof resolvedSrc === "string") setLoadedSrc(resolvedSrc);
		onLoad?.(event);
	};
	const handleError = (event) => {
		onError?.(event);
	};
	if (!resolvedSrc) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image$1, {
		src: resolvedSrc,
		alt,
		fill: true,
		sizes: rest.sizes ?? "100vw",
		loading: "lazy",
		className: cn(interactiveTransitionClass, isLoaded ? "opacity-100" : "opacity-0", className),
		onLoad: handleLoad,
		onError: handleError,
		...rest
	});
}
//#endregion
//#region src/features/dashboard/collaboration/components/image-preview-modal-sections.tsx
function ThumbnailButton({ image, index, initialIndex, normalizedIndex, totalImages, onSelectThumbnail }) {
	const onSelectThumbnailClick = (e) => {
		e.stopPropagation();
		onSelectThumbnail(index - initialIndex);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": `Image ${index + 1} of ${totalImages}: ${image.name}`,
		"aria-current": index === normalizedIndex || void 0,
		className: cn("size-14 overflow-hidden rounded-md border-2 motion-chromatic", index === normalizedIndex ? "border-viewer-chrome opacity-100" : "border-transparent opacity-50 hover:opacity-80"),
		onClick: onSelectThumbnailClick,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyImage, {
			src: image.url,
			alt: "",
			className: "size-full object-cover"
		})
	}, `${image.url}-${image.name}`);
}
function ImagePreviewModalDialog({ currentImage, hasMultipleImages, normalizedIndex, images, initialIndex, isOpen, zoom, isDragging, imageStyle, handleOnOpenChange, handleStopPropagation, handleZoomOutClick, handleZoomInClick, handleCloseClick, handlePreviousClick, handleNextClick, handleMouseDown, handleMouseMove, handleMouseUp, handleImageAreaKeyDown, handleImageClick, handleSelectThumbnail, handleClose }) {
	if (!isOpen || !currentImage) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		open: isOpen,
		onOpenChange: handleOnOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Portal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay, { className: "fixed inset-0 z-[1200] bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Content, {
			className: "fixed inset-0 z-[1200] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-viewer-chrome/60 focus-visible:ring-offset-0",
			onPointerDownOutside: handleClose,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Title, {
					className: "sr-only",
					children: ["Image Preview: ", currentImage.name]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium text-viewer-chrome/90 truncate max-w-[300px]",
								children: currentImage.name
							}),
							currentImage.size && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-viewer-chrome/60",
								children: currentImage.size
							}),
							hasMultipleImages && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded-full bg-viewer-chrome/10 px-2 py-0.5 text-xs text-viewer-chrome/80",
								children: [
									normalizedIndex + 1,
									" / ",
									images.length
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "ghost",
								size: "icon",
								className: "size-9 text-viewer-chrome/80 hover:text-viewer-chrome hover:bg-viewer-chrome/10",
								onClick: handleZoomOutClick,
								disabled: zoom <= 1,
								"aria-label": "Zoom out",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomOut, {
									className: "size-5",
									"aria-hidden": true
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-[50px] text-center text-xs text-viewer-chrome/70",
								"aria-live": "polite",
								children: [Math.round(zoom * 100), "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "ghost",
								size: "icon",
								className: "size-9 text-viewer-chrome/80 hover:text-viewer-chrome hover:bg-viewer-chrome/10",
								onClick: handleZoomInClick,
								disabled: zoom >= 4,
								"aria-label": "Zoom in",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, {
									className: "size-5",
									"aria-hidden": true
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-2 h-6 w-px bg-viewer-chrome/20" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "size-9 text-viewer-chrome/80 hover:text-viewer-chrome hover:bg-viewer-chrome/10",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: currentImage.url,
									target: "_blank",
									rel: "noopener noreferrer",
									onClick: handleStopPropagation,
									"aria-label": `Open ${currentImage.name} in new tab`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
										className: "size-5",
										"aria-hidden": true
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "size-9 text-viewer-chrome/80 hover:text-viewer-chrome hover:bg-viewer-chrome/10",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: currentImage.url,
									download: currentImage.name,
									onClick: handleStopPropagation,
									"aria-label": `Download ${currentImage.name}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
										className: "size-5",
										"aria-hidden": true
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-2 h-6 w-px bg-viewer-chrome/20" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "ghost",
								size: "icon",
								className: "size-9 text-viewer-chrome/80 hover:text-viewer-chrome hover:bg-viewer-chrome/10",
								onClick: handleCloseClick,
								"aria-label": "Close preview",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
									className: "size-5",
									"aria-hidden": true
								})
							})
						]
					})]
				}),
				hasMultipleImages && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "icon",
					className: "absolute left-4 top-1/2 z-10 size-12 -translate-y-1/2 rounded-full bg-black/40 text-viewer-chrome hover:bg-black/60",
					onClick: handlePreviousClick,
					"aria-label": "Previous image",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
						className: "size-8",
						"aria-hidden": true
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "icon",
					className: "absolute right-4 top-1/2 z-10 size-12 -translate-y-1/2 rounded-full bg-black/40 text-viewer-chrome hover:bg-black/60",
					onClick: handleNextClick,
					"aria-label": "Next image",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
						className: "size-8",
						"aria-hidden": true
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "flex size-full items-center justify-center overflow-hidden p-16",
					onClick: handleStopPropagation,
					onMouseDown: handleMouseDown,
					onMouseMove: handleMouseMove,
					onMouseUp: handleMouseUp,
					onMouseLeave: handleMouseUp,
					onKeyDown: handleImageAreaKeyDown,
					"aria-label": `Preview image ${currentImage.name}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyImage, {
						src: currentImage.url,
						alt: currentImage.name,
						className: cn("max-h-full max-w-full object-contain transition-transform duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)] motion-reduce:transition-none", zoom > 1 ? "cursor-grab" : "cursor-zoom-in", isDragging && "cursor-grabbing"),
						style: imageStyle,
						onClick: handleImageClick,
						draggable: false
					})
				}),
				hasMultipleImages && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-2 bg-gradient-to-t from-black/60 to-transparent p-4",
					children: images.map((image, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThumbnailButton, {
						image,
						index,
						initialIndex,
						normalizedIndex,
						totalImages: images.length,
						onSelectThumbnail: handleSelectThumbnail
					}, `${image.url}-${image.name}`))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute bottom-4 right-4 text-xs text-viewer-chrome/40",
					"aria-hidden": true,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "← → Navigate" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mx-2",
							children: "•"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "+/- Zoom" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mx-2",
							children: "•"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Esc Close" })
					]
				})
			]
		})] })
	});
}
//#endregion
//#region src/features/dashboard/collaboration/components/image-preview-modal-reducer.ts
function createInitialImagePreviewState() {
	return {
		indexOffset: 0,
		zoom: 1,
		isDragging: false,
		position: {
			x: 0,
			y: 0
		}
	};
}
function imagePreviewReducer(state, action) {
	switch (action.type) {
		case "setIndexOffset": return {
			...state,
			indexOffset: typeof action.value === "function" ? action.value(state.indexOffset) : action.value
		};
		case "setZoom": return {
			...state,
			zoom: typeof action.value === "function" ? action.value(state.zoom) : action.value
		};
		case "setIsDragging": return {
			...state,
			isDragging: action.value
		};
		case "setPosition": return {
			...state,
			position: action.value
		};
		case "resetView": return {
			...state,
			zoom: 1,
			position: {
				x: 0,
				y: 0
			}
		};
		case "navigate": return {
			...state,
			indexOffset: action.direction === "previous" ? state.indexOffset - 1 : state.indexOffset + 1,
			zoom: 1,
			position: {
				x: 0,
				y: 0
			}
		};
		case "selectThumbnail": return {
			...state,
			indexOffset: action.offset,
			zoom: 1,
			position: {
				x: 0,
				y: 0
			}
		};
		case "zoomIn": return {
			...state,
			zoom: Math.min(state.zoom + .5, 4)
		};
		case "zoomOut": {
			const newZoom = Math.max(state.zoom - .5, 1);
			return {
				...state,
				zoom: newZoom,
				position: newZoom === 1 ? {
					x: 0,
					y: 0
				} : state.position
			};
		}
		case "close": return createInitialImagePreviewState();
		default: return state;
	}
}
//#endregion
//#region src/features/dashboard/collaboration/components/use-image-preview-modal.ts
function useImagePreviewModal({ images, initialIndex = 0, isOpen, onClose }) {
	const [state, dispatch] = (0, import_react.useReducer)(imagePreviewReducer, void 0, createInitialImagePreviewState);
	const { indexOffset, zoom, isDragging, position } = state;
	const dragStartRef = (0, import_react.useRef)({
		x: 0,
		y: 0
	});
	const normalizedIndex = images.length > 0 ? ((initialIndex + indexOffset) % images.length + images.length) % images.length : 0;
	const currentImage = images[normalizedIndex];
	const hasMultipleImages = images.length > 1;
	const handleClose = () => {
		dispatch({ type: "close" });
		onClose();
	};
	const handlePrevious = () => {
		dispatch({
			type: "navigate",
			direction: "previous"
		});
	};
	const handleNext = () => {
		dispatch({
			type: "navigate",
			direction: "next"
		});
	};
	const handleZoomIn = () => {
		dispatch({ type: "zoomIn" });
	};
	const handleZoomOut = () => {
		dispatch({ type: "zoomOut" });
	};
	const handleSelectThumbnail = (offset) => {
		dispatch({
			type: "selectThumbnail",
			offset
		});
	};
	const handleMouseDown = (e) => {
		if (zoom > 1) {
			dispatch({
				type: "setIsDragging",
				value: true
			});
			dragStartRef.current = {
				x: e.clientX - position.x,
				y: e.clientY - position.y
			};
		}
	};
	const handleMouseMove = (e) => {
		if (isDragging && zoom > 1) dispatch({
			type: "setPosition",
			value: {
				x: e.clientX - dragStartRef.current.x,
				y: e.clientY - dragStartRef.current.y
			}
		});
	};
	const handleMouseUp = () => {
		dispatch({
			type: "setIsDragging",
			value: false
		});
	};
	const handleOnOpenChange = (open) => {
		if (!open) handleClose();
	};
	const handleStopPropagation = (e) => {
		e.stopPropagation();
	};
	const handleZoomOutClick = (e) => {
		e.stopPropagation();
		handleZoomOut();
	};
	const handleZoomInClick = (e) => {
		e.stopPropagation();
		handleZoomIn();
	};
	const handleCloseClick = (e) => {
		e.stopPropagation();
		handleClose();
	};
	const handlePreviousClick = (e) => {
		e.stopPropagation();
		handlePrevious();
	};
	const handleNextClick = (e) => {
		e.stopPropagation();
		handleNext();
	};
	const handleImageAreaKeyDown = (e) => {
		if (e.key === "Escape") {
			e.preventDefault();
			handleClose();
		}
	};
	const handleImageClick = (e) => {
		e.stopPropagation();
		if (zoom === 1) handleZoomIn();
	};
	const imageStyle = { transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)` };
	const handleWindowKeyDown = (0, import_react.useEffectEvent)((e) => {
		if (!isOpen) return;
		switch (e.key) {
			case "Escape":
				handleClose();
				break;
			case "ArrowLeft":
				handlePrevious();
				break;
			case "ArrowRight":
				handleNext();
				break;
			case "+":
			case "=":
				handleZoomIn();
				break;
			case "-":
				handleZoomOut();
				break;
		}
	});
	(0, import_react.useEffect)(() => {
		const handleKeyDown = (e) => {
			handleWindowKeyDown(e);
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);
	return {
		currentImage,
		hasMultipleImages,
		normalizedIndex,
		images,
		initialIndex,
		isOpen,
		zoom,
		isDragging,
		imageStyle,
		handleOnOpenChange,
		handleStopPropagation,
		handleZoomOutClick,
		handleZoomInClick,
		handleCloseClick,
		handlePreviousClick,
		handleNextClick,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
		handleImageAreaKeyDown,
		handleImageClick,
		handleSelectThumbnail,
		handleClose
	};
}
//#endregion
//#region src/features/dashboard/collaboration/components/image-preview-modal.tsx
function ImagePreviewModal(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePreviewModalDialog, { ...useImagePreviewModal(props) });
}
//#endregion
//#region src/features/dashboard/collaboration/components/image-gallery.tsx
function PreviewTile({ image, previewIndex, onPreview, className, aspectClassName = "aspect-square", overlayCount }) {
	const handlePreview = (event) => {
		onPreview(Number(event.currentTarget.dataset.previewIndex));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: handlePreview,
		"data-preview-index": previewIndex,
		className: cn("group relative overflow-hidden rounded-lg border border-muted/60 bg-muted/10 text-left motion-chromatic hover:border-muted", className),
		"aria-label": `Preview image ${image.name}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("relative overflow-hidden", aspectClassName),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyImage, {
				src: image.url,
				alt: image.name,
				className: "size-full object-cover transition-transform duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-out)] motion-reduce:transition-none group-hover:scale-105"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20",
				children: typeof overlayCount === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-0 flex items-center justify-center bg-black/50 text-2xl font-bold text-viewer-chrome",
					children: ["+", overlayCount]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-full bg-black/60 p-2 text-viewer-chrome opacity-0 transition-opacity group-hover:opacity-100",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, { className: "size-4" })
				})
			})]
		})
	});
}
function ImageGallery({ images, className }) {
	const [previewOpen, setPreviewOpen] = (0, import_react.useState)(false);
	const [previewIndex, setPreviewIndex] = (0, import_react.useState)(0);
	const handleImageClick = (index) => {
		setPreviewIndex(index);
		setPreviewOpen(true);
	};
	const handleClosePreview = () => {
		setPreviewOpen(false);
	};
	if (!images.length) return null;
	if (images.length === 1) {
		const image = images[0];
		if (!image) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
			className: cn("my-2 max-w-xl overflow-hidden rounded-lg border border-muted/60 bg-muted/10", className),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewTile, {
				image,
				previewIndex: 0,
				onPreview: handleImageClick,
				aspectClassName: "aspect-video max-h-96",
				className: "rounded-none border-0"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figcaption", {
				className: "flex items-center justify-between gap-3 border-t border-muted/40 p-3 text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-1 items-center gap-2 truncate",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "size-4 flex-shrink-0" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: image.name
						}),
						image.size ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "whitespace-nowrap text-muted-foreground/60",
							children: image.size
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					size: "sm",
					className: "h-7 px-2 text-xs",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: image.url,
						download: image.name,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1 size-3.5" }), "Download"]
					})
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePreviewModal, {
			images,
			initialIndex: previewIndex,
			isOpen: previewOpen,
			onClose: handleClosePreview
		})] });
	}
	const modal = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePreviewModal, {
		images,
		initialIndex: previewIndex,
		isOpen: previewOpen,
		onClose: handleClosePreview
	});
	if (images.length === 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("grid max-w-xl grid-cols-2 gap-2", className),
		children: images.map((image, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewTile, {
			image,
			previewIndex: index,
			onPreview: handleImageClick
		}, image.url))
	}), modal] });
	if (images.length === 3) {
		const firstImage = images[0];
		if (!firstImage) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("grid max-w-xl grid-cols-2 gap-2", className),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewTile, {
				image: firstImage,
				previewIndex: 0,
				onPreview: handleImageClick,
				className: "col-span-1 row-span-2",
				aspectClassName: "aspect-[3/4]"
			}), images.slice(1, 3).map((image, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewTile, {
				image,
				previewIndex: index + 1,
				onPreview: handleImageClick
			}, image.url))]
		}), modal] });
	}
	const displayImages = images.slice(0, 4);
	const remainingCount = images.length - 4;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("grid max-w-xl grid-cols-2 gap-2", className),
		children: displayImages.map((image, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewTile, {
			image,
			previewIndex: index,
			onPreview: handleImageClick,
			overlayCount: index === 3 && remainingCount > 0 ? remainingCount : void 0
		}, image.url))
	}), modal] });
}
//#endregion
//#region src/features/dashboard/collaboration/components/search-highlighter.tsx
function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function highlightText(text, terms) {
	if (!terms || terms.length === 0 || !text) return text;
	const filtered = terms.flatMap((term) => {
		const normalizedTerm = term.trim();
		return normalizedTerm ? [normalizedTerm] : [];
	});
	if (filtered.length === 0) return text;
	const pattern = filtered.map((term) => escapeRegExp(term)).join("|");
	const regex = new RegExp(`(${pattern})`, "gi");
	const segments = text.split(regex);
	let cursor = 0;
	return segments.map((segment) => {
		const keyBase = cursor;
		cursor += segment.length;
		if (segment === "") return null;
		if (regex.test(segment)) {
			regex.lastIndex = 0;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mark", {
				className: "rounded-sm bg-accent/20 px-0.5 py-[1px] text-primary",
				children: segment
			}, `highlight-${keyBase}`);
		}
		regex.lastIndex = 0;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: segment }, `text-${keyBase}`);
	});
}
function hasHighlightTerms(terms) {
	return Array.isArray(terms) && terms.some((term) => term.trim().length > 0);
}
//#endregion
//#region src/features/dashboard/collaboration/lib/chat-text.ts
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
//#endregion
//#region src/features/dashboard/collaboration/lib/utils.ts
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
//#region src/shared/ui/chat-media-gallery-utils.ts
function getAttachmentKind(attachment) {
	const type = (attachment.type || "").toLowerCase();
	const url = attachment.url || "";
	const name = attachment.name.toLowerCase();
	if (isLikelyImageUrl(url) || type.startsWith("image/")) return "image";
	if (type.startsWith("video/") || /\.(mp4|mov|webm|ogg)(\?.*)?$/i.test(url)) return "video";
	if (type.startsWith("audio/") || /\.(mp3|wav|m4a|aac)(\?.*)?$/i.test(url)) return "audio";
	if (type.includes("pdf") || name.endsWith(".pdf") || url.toLowerCase().includes(".pdf")) return "pdf";
	if (type.includes("spreadsheet") || type.includes("excel") || /\.(xlsx?|csv)(\?.*)?$/i.test(name)) return "spreadsheet";
	if (type.includes("zip") || /\.(zip|rar|7z)(\?.*)?$/i.test(name)) return "archive";
	return "file";
}
//#endregion
//#region src/shared/ui/chat-media-gallery.tsx
function hasUsableAttachmentUrl(url) {
	if (typeof url !== "string") return false;
	const normalized = url.trim();
	return normalized.length > 0 && normalized !== "#" && normalized !== "about:blank";
}
function AttachmentKindIcon({ kind, className }) {
	const iconClass = cn("size-5", className);
	switch (kind) {
		case "image": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
			className: iconClass,
			"aria-hidden": true
		});
		case "video": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, {
			className: iconClass,
			"aria-hidden": true
		});
		case "pdf": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
			className: iconClass,
			"aria-hidden": true
		});
		case "audio": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, {
			className: iconClass,
			"aria-hidden": true
		});
		case "spreadsheet": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, {
			className: iconClass,
			"aria-hidden": true
		});
		case "archive": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileArchive, {
			className: iconClass,
			"aria-hidden": true
		});
		default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(File$1, {
			className: iconClass,
			"aria-hidden": true
		});
	}
}
var KIND_SURFACE = {
	image: "bg-info/10 text-info ring-info/15",
	video: "bg-accent/10 text-accent ring-accent/15",
	pdf: "bg-destructive/10 text-destructive ring-destructive/15",
	audio: "bg-warning/10 text-warning ring-warning/15",
	spreadsheet: "bg-success/10 text-success ring-success/15",
	archive: "bg-muted text-muted-foreground ring-border/50",
	file: "bg-primary/10 text-primary ring-primary/15"
};
function AttachmentName({ name, highlightTerms }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "truncate font-medium",
		title: name,
		children: hasHighlightTerms(highlightTerms) ? highlightText(name, highlightTerms) : name
	});
}
function MediaTile({ attachment, kind, highlightTerms, onOpenPdf, compact }) {
	const handleOpenPdf = () => {
		onOpenPdf?.(attachment);
	};
	if (kind === "video") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm", compact && "max-w-md"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2 border-b border-border/50 px-3 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-center gap-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("flex size-8 shrink-0 items-center justify-center rounded-xl ring-1", KIND_SURFACE.video),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentKindIcon, {
							kind: "video",
							className: "size-4"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentName, {
						name: attachment.name,
						highlightTerms
					}),
					attachment.size ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: "shrink-0 text-[10px]",
						children: attachment.size
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "ghost",
				size: "sm",
				className: "h-8 shrink-0 gap-1 rounded-lg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: attachment.url,
					target: "_blank",
					rel: "noopener noreferrer",
					download: true,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
						className: "size-3.5",
						"aria-hidden": true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "sr-only",
						children: "Download"
					})]
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "bg-muted/20 p-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				src: attachment.url,
				controls: true,
				"aria-label": attachment.name || "Video attachment",
				className: "max-h-72 w-full rounded-xl bg-foreground",
				preload: "metadata",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("track", {
					kind: "captions",
					label: `${attachment.name} captions`
				})
			})
		})]
	});
	if (kind === "pdf") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("group flex items-center gap-3 rounded-2xl border border-border/60 bg-card/90 p-3 shadow-sm transition hover:border-primary/25 hover:shadow-md motion-reduce:transition-none", compact && "max-w-md"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("flex size-11 shrink-0 items-center justify-center rounded-xl ring-1", KIND_SURFACE.pdf),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentKindIcon, { kind: "pdf" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentName, {
					name: attachment.name,
					highlightTerms
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [attachment.size ? `${attachment.size} · ` : "", "PDF document"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center gap-1",
				children: [onOpenPdf ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					size: "sm",
					className: "h-8 gap-1 rounded-lg",
					onClick: handleOpenPdf,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorPlay, {
						className: "size-3.5",
						"aria-hidden": true
					}), "Preview"]
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					size: "icon",
					className: "size-8 rounded-lg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: attachment.url,
						target: "_blank",
						rel: "noopener noreferrer",
						"aria-label": `Open ${attachment.name}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })
					})
				})]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href: attachment.url,
		target: "_blank",
		rel: "noopener noreferrer",
		className: cn("group flex items-center gap-3 rounded-2xl border border-border/60 bg-card/90 p-3 shadow-sm transition hover:border-primary/25 hover:shadow-md motion-reduce:transition-none", compact && "max-w-md"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("flex size-11 shrink-0 items-center justify-center rounded-xl ring-1", KIND_SURFACE[kind]),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentKindIcon, { kind })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentName, {
					name: attachment.name,
					highlightTerms
				}), attachment.size ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: attachment.size
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
				className: "size-4 shrink-0 text-muted-foreground transition group-hover:text-foreground",
				"aria-hidden": true
			})
		]
	});
}
function ChatMediaGallery({ attachments, highlightTerms, compact = false, className }) {
	const [activePdf, setActivePdf] = (0, import_react.useState)(null);
	const grouped = (() => {
		const images = [];
		const videos = [];
		const pdfs = [];
		const other = [];
		const unavailable = [];
		for (const attachment of attachments) {
			if (!hasUsableAttachmentUrl(attachment.url)) {
				unavailable.push(attachment);
				continue;
			}
			const kind = getAttachmentKind(attachment);
			if (kind === "image") images.push(attachment);
			else if (kind === "video") videos.push(attachment);
			else if (kind === "pdf") pdfs.push(attachment);
			else other.push(attachment);
		}
		return {
			images,
			videos,
			pdfs,
			other,
			unavailable
		};
	})();
	const downloadable = attachments.filter((a) => hasUsableAttachmentUrl(a.url));
	const handleDownloadAll = () => {
		downloadable.forEach((attachment, index) => {
			const anchor = document.createElement("a");
			anchor.href = attachment.url;
			anchor.download = attachment.name || `attachment-${index + 1}`;
			anchor.target = "_blank";
			document.body.appendChild(anchor);
			anchor.click();
			document.body.removeChild(anchor);
		});
	};
	const handlePdfDialogOpenChange = (open) => {
		if (!open) setActivePdf(null);
	};
	if (!attachments.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-3", className),
		children: [
			!compact && attachments.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2 text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					attachments.length,
					" attachment",
					attachments.length === 1 ? "" : "s"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "ghost",
					size: "sm",
					className: "h-7 gap-1 rounded-lg px-2",
					onClick: handleDownloadAll,
					disabled: downloadable.length === 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
						className: "size-3.5",
						"aria-hidden": true
					}), "Download all"]
				})]
			}) : null,
			grouped.images.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageGallery, { images: grouped.images.map((a) => ({
				url: a.url,
				name: a.name,
				size: a.size ?? void 0
			})) }) : null,
			grouped.videos.map((attachment) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaTile, {
				attachment,
				kind: "video",
				highlightTerms,
				compact
			}, `${attachment.url}-video`)),
			grouped.pdfs.map((attachment) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaTile, {
				attachment,
				kind: "pdf",
				highlightTerms,
				onOpenPdf: setActivePdf,
				compact
			}, `${attachment.url}-pdf`)),
			grouped.other.map((attachment) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaTile, {
				attachment,
				kind: getAttachmentKind(attachment),
				highlightTerms,
				compact
			}, `${attachment.url}-${attachment.name}`)),
			grouped.unavailable.map((attachment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/15 p-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 ring-1 ring-border/50",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
							className: "size-4 text-muted-foreground",
							"aria-hidden": true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentName, {
							name: attachment.name,
							highlightTerms
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Syncing - preview available when ready."
						})]
					}),
					attachment.size ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: "shrink-0 text-[10px]",
						children: attachment.size
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "shrink-0 text-[10px]",
						children: "Preparing"
					})
				]
			}, `${attachment.name}-pending`)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: Boolean(activePdf),
				onOpenChange: handlePdfDialogOpenChange,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden p-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
						className: "border-b border-border/50 px-5 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "truncate pr-8",
							children: activePdf?.name ?? "PDF preview"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Inline preview · open in a new tab for full controls." })]
					}), activePdf ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-h-0 flex-1 flex-col",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
							src: activePdf.url,
							title: activePdf.name,
							sandbox: "",
							className: "min-h-[60vh] w-full flex-1 bg-muted/20"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-end gap-2 border-t border-border/50 px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								size: "sm",
								className: "rounded-lg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: activePdf.url,
									target: "_blank",
									rel: "noopener noreferrer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
										className: "mr-1.5 size-3.5",
										"aria-hidden": true
									}), "Open in tab"]
								})
							})
						})]
					}) : null]
				})
			})
		]
	});
}
//#endregion
//#region src/shared/ui/chat-typing-indicator.tsx
function TypingDots({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1", className),
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-primary animate-subtle-dot-drift [animation-delay:0ms]" }, "typing-dot-0"),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-primary animate-subtle-dot-drift [animation-delay:150ms]" }, "typing-dot-150"),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-primary animate-subtle-dot-drift [animation-delay:300ms]" }, "typing-dot-300")
		]
	});
}
function ChatTypingIndicator({ label, variant = "bubble", icon, className }) {
	if (variant === "inline") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
		className: cn("flex items-center gap-2 text-xs text-muted-foreground", className),
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypingDots, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label })]
	});
	if (variant === "composer") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
		className: cn("flex min-h-[1rem] items-center gap-2 text-[11px] leading-snug text-muted-foreground", className),
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypingDots, { className: "scale-90" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children: label
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
		className: cn("flex items-end gap-2.5 px-1 py-2 motion-reduce:py-1", className),
		"aria-live": "polite",
		"aria-atomic": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/60 ring-1 ring-border/50",
			children: icon ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
				className: "size-4 text-primary",
				"aria-hidden": true
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-w-[min(100%,20rem)] rounded-2xl rounded-tl-md border border-border/60 bg-card/95 px-4 py-3 shadow-sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypingDots, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted-foreground",
					children: label
				})]
			})
		})]
	});
}
//#endregion
//#region src/shared/ui/textarea.tsx
var Textarea = ({ className, autoGrow, onChange, ref, ...props }) => {
	const internalRef = import_react.useRef(null);
	const handleTextareaRef = (node) => {
		internalRef.current = node;
		if (typeof ref === "function") {
			ref(node);
			return;
		}
		if (ref) ref.current = node;
	};
	const onTextareaChange = (e) => {
		if (autoGrow && internalRef.current) {
			const textarea = internalRef.current;
			textarea.style.cssText = "height:auto";
			textarea.style.cssText = `height:${textarea.scrollHeight}px`;
		}
		onChange?.(e);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		ref: handleTextareaRef,
		className: cn("flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60", "focus-ring-subtle focus-visible:border-primary hover:border-muted-foreground/30", "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50", "resize-y", autoGrow && "resize-none overflow-hidden", interactiveTransitionClass, className),
		onChange: onTextareaChange,
		...props
	});
};
Textarea.displayName = "Textarea";
//#endregion
//#region src/shared/hooks/use-voice-input.ts
var ERROR_MESSAGES = {
	"not-allowed": "Microphone access denied. Please allow microphone access in your browser settings.",
	"no-speech": "No speech detected. Tap the microphone and try speaking again.",
	"network": "Network error. Retrying…",
	"audio-capture": "No microphone found. Please check your audio settings.",
	"aborted": null,
	"service-not-allowed": "Speech service not available. Try using Chrome browser.",
	"language-not-supported": "Language not supported for speech recognition."
};
function getSpeechRecognition() {
	if (typeof window === "undefined") return null;
	return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}
var globalRecognition = null;
var globalIsListening = false;
function useVoiceInput(options = {}) {
	const { language = "en-US", continuous = false, silenceTimeout = 10, maxDuration = 60 } = options;
	const isSupported = (0, import_react.useSyncExternalStore)(() => () => void 0, () => getSpeechRecognition() !== null, () => false);
	const [isListeningState, setIsListeningState] = (0, import_react.useState)(false);
	const [transcript, setTranscript] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [timeRemaining, setTimeRemaining] = (0, import_react.useState)(null);
	const [retryCount, setRetryCount] = (0, import_react.useState)(0);
	const optionsRef = (0, import_react.useRef)(options);
	const silenceTimeoutRef = (0, import_react.useRef)(null);
	const maxDurationTimeoutRef = (0, import_react.useRef)(null);
	const countdownIntervalRef = (0, import_react.useRef)(null);
	const isMountedRef = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		optionsRef.current = options;
	}, [options]);
	(0, import_react.useEffect)(() => {
		isMountedRef.current = true;
		const checkGlobalState = setInterval(() => {
			if (!isMountedRef.current) return;
			if (globalIsListening !== isListeningState) setIsListeningState(globalIsListening);
		}, 100);
		return () => {
			clearInterval(checkGlobalState);
			isMountedRef.current = false;
		};
	}, [isListeningState]);
	const clearTimers = () => {
		if (silenceTimeoutRef.current) {
			clearTimeout(silenceTimeoutRef.current);
			silenceTimeoutRef.current = null;
		}
		if (maxDurationTimeoutRef.current) {
			clearTimeout(maxDurationTimeoutRef.current);
			maxDurationTimeoutRef.current = null;
		}
		if (countdownIntervalRef.current) {
			clearInterval(countdownIntervalRef.current);
			countdownIntervalRef.current = null;
		}
		setTimeRemaining(null);
	};
	const stopListening = () => {
		clearTimers();
		if (globalRecognition) {
			try {
				globalRecognition.stop();
			} catch {}
			globalRecognition = null;
		}
		globalIsListening = false;
		setIsListeningState(false);
	};
	const startListening = () => {
		const SpeechRecognition = getSpeechRecognition();
		if (!SpeechRecognition) {
			const msg = "Speech recognition is not supported in this browser. Try Chrome.";
			setError(msg);
			optionsRef.current.onError?.(msg);
			return;
		}
		stopListening();
		clearTimers();
		setError(null);
		setTranscript("");
		setRetryCount(0);
		const recognition = new SpeechRecognition();
		globalRecognition = recognition;
		recognition.continuous = continuous;
		recognition.interimResults = true;
		recognition.lang = language;
		recognition.onstart = () => {
			globalIsListening = true;
			setIsListeningState(true);
			setTimeRemaining(maxDuration);
			const startTime = Date.now();
			countdownIntervalRef.current = setInterval(() => {
				const elapsed = Math.floor((Date.now() - startTime) / 1e3);
				const remaining = Math.max(0, maxDuration - elapsed);
				setTimeRemaining(remaining);
				if (remaining <= 0) clearTimers();
			}, 1e3);
			maxDurationTimeoutRef.current = setTimeout(() => {
				if (globalRecognition) stopListening();
			}, maxDuration * 1e3);
			if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
			silenceTimeoutRef.current = setTimeout(() => {
				if (globalIsListening && globalRecognition) {
					const msg = "Stopped listening due to silence. Tap mic to try again.";
					setError(msg);
					optionsRef.current.onError?.(msg);
					stopListening();
				}
			}, silenceTimeout * 1e3);
		};
		recognition.onresult = (event) => {
			try {
				const results = event.results;
				if (!results || results.length === 0) return;
				if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
				silenceTimeoutRef.current = setTimeout(() => {
					if (globalIsListening && globalRecognition) {
						const msg = "Stopped listening due to silence. Tap mic to try again.";
						setError(msg);
						optionsRef.current.onError?.(msg);
						stopListening();
					}
				}, silenceTimeout * 1e3);
				let finalTranscript = "";
				let interimTranscript = "";
				const startIndex = Math.max(0, event.resultIndex ?? 0);
				for (let i = startIndex; i < results.length; i++) {
					const result = results[i];
					const transcriptPart = result?.[0]?.transcript;
					if (!transcriptPart) continue;
					if (result.isFinal) finalTranscript += transcriptPart;
					else interimTranscript += transcriptPart;
				}
				const currentTranscript = (finalTranscript || interimTranscript).trim();
				setTranscript(currentTranscript);
				if (currentTranscript) {
					setError(null);
					setRetryCount(0);
				}
				if (finalTranscript.trim()) optionsRef.current.onResult?.(finalTranscript.trim());
			} catch {
				const msg = "Voice input encountered an unexpected error";
				setError(msg);
				setIsListeningState(false);
				optionsRef.current.onError?.(msg);
			}
		};
		recognition.onerror = (event) => {
			const errorType = event.error;
			const errorMessage = ERROR_MESSAGES[errorType] ?? event.message ?? `Error: ${errorType}`;
			if (errorType === "aborted") {
				globalIsListening = false;
				setIsListeningState(false);
				clearTimers();
				return;
			}
			setError(errorMessage);
			globalIsListening = false;
			setIsListeningState(false);
			clearTimers();
			if (errorMessage) optionsRef.current.onError?.(errorMessage);
		};
		recognition.onend = () => {
			globalIsListening = false;
			setIsListeningState(false);
			clearTimers();
			if (globalRecognition === recognition) globalRecognition = null;
		};
		try {
			recognition.start();
		} catch {
			const msg = "Failed to start voice input. Please try again.";
			setError(msg);
			setIsListeningState(false);
			optionsRef.current.onError?.(msg);
		}
	};
	const toggleListening = () => {
		if (globalIsListening) stopListening();
		else startListening();
	};
	const clearError = () => {
		setError(null);
	};
	return {
		isSupported,
		isListening: isListeningState,
		startListening,
		stopListening,
		toggleListening,
		transcript,
		error,
		timeRemaining,
		retryCount,
		clearError
	};
}
//#endregion
//#region src/shared/hooks/use-audio-analyzer.ts
var INITIAL_FREQUENCIES = new Array(12).fill(0);
function createInitialAudioAnalyzerState() {
	return {
		volume: 0,
		frequencies: INITIAL_FREQUENCIES,
		isAnalyzing: false,
		error: null
	};
}
function audioAnalyzerReducer(state, action) {
	switch (action.type) {
		case "start": return {
			...state,
			isAnalyzing: true,
			error: null
		};
		case "update": return {
			...state,
			volume: action.volume,
			frequencies: action.frequencies
		};
		case "error": return {
			...state,
			isAnalyzing: false,
			error: action.message
		};
		case "stop": return {
			volume: 0,
			frequencies: INITIAL_FREQUENCIES,
			isAnalyzing: false,
			error: null
		};
		default: return state;
	}
}
function useAudioAnalyzer(isActive) {
	const [state, dispatch] = (0, import_react.useReducer)(audioAnalyzerReducer, void 0, createInitialAudioAnalyzerState);
	const audioContextRef = (0, import_react.useRef)(null);
	const analyzerRef = (0, import_react.useRef)(null);
	const sourceRef = (0, import_react.useRef)(null);
	const animationFrameRef = (0, import_react.useRef)(null);
	const streamRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const stopAnalyzing = () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
			if (sourceRef.current) {
				sourceRef.current.disconnect();
				sourceRef.current = null;
			}
			if (audioContextRef.current && audioContextRef.current.state !== "closed") {
				audioContextRef.current.close();
				audioContextRef.current = null;
			}
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((track) => track.stop());
				streamRef.current = null;
			}
			dispatch({ type: "stop" });
		};
		if (!isActive) {
			stopAnalyzing();
			return;
		}
		async function startAnalyzing() {
			try {
				if (typeof window === "undefined") return;
				if (!navigator?.mediaDevices?.getUserMedia) {
					dispatch({
						type: "error",
						message: "Microphone is not supported in this browser"
					});
					return;
				}
				const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
				if (!AudioContextCtor) {
					dispatch({
						type: "error",
						message: "Audio analysis is not supported in this browser"
					});
					return;
				}
				const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
				streamRef.current = stream;
				const audioContext = new AudioContextCtor();
				audioContextRef.current = audioContext;
				const analyzer = audioContext.createAnalyser();
				analyzer.fftSize = 128;
				analyzer.smoothingTimeConstant = .6;
				analyzerRef.current = analyzer;
				const source = audioContext.createMediaStreamSource(stream);
				source.connect(analyzer);
				sourceRef.current = source;
				dispatch({ type: "start" });
				const bufferLength = analyzer.frequencyBinCount;
				const dataArray = new Uint8Array(bufferLength);
				const updateVolume = () => {
					if (!analyzerRef.current) return;
					analyzerRef.current.getByteFrequencyData(dataArray);
					const binCount = 12;
					const bins = new Array(binCount).fill(0);
					const samplesPerBin = Math.floor(bufferLength * .7 / binCount);
					for (let i = 0; i < binCount; i++) {
						let sum = 0;
						for (let j = 0; j < samplesPerBin; j++) sum += dataArray[i * samplesPerBin + j] || 0;
						bins[i] = sum / samplesPerBin / 255;
					}
					let totalSum = 0;
					for (let i = 0; i < bufferLength; i++) totalSum += dataArray[i];
					const average = totalSum / bufferLength;
					dispatch({
						type: "update",
						volume: Math.min(1, average / 128),
						frequencies: bins
					});
					animationFrameRef.current = requestAnimationFrame(updateVolume);
				};
				updateVolume();
			} catch (err) {
				console.error("Error accessing microphone:", err);
				dispatch({
					type: "error",
					message: "Failed to access microphone for visualization"
				});
			}
		}
		startAnalyzing();
		return () => {
			stopAnalyzing();
		};
	}, [isActive]);
	return state;
}
//#endregion
//#region src/shared/ui/voice-waveform.tsx
var waveformPulseDurationSeconds = motionDurationSeconds.xslow * 2;
function getWaveformAnimateProps(isActive, height) {
	return {
		height: isActive ? height : 8,
		opacity: isActive ? [
			.7,
			1,
			.7
		] : .3,
		backgroundColor: isActive ? "var(--primary)" : "var(--muted-foreground)"
	};
}
function getWaveformTransitionProps(delay) {
	return {
		height: {
			type: "spring",
			stiffness: 400,
			damping: 25,
			mass: .5
		},
		opacity: {
			duration: waveformPulseDurationSeconds,
			ease: motionEasing.inOut,
			repeat: Infinity,
			delay
		}
	};
}
function VoiceWaveform({ isActive, barCount = 12, className }) {
	const { frequencies } = useAudioAnalyzer(isActive);
	const bars = (() => {
		return (!isActive ? new Array(barCount).fill(8) : frequencies.map((freq, index) => {
			const baseHeight = 8;
			const dynamicHeight = Math.pow(freq, .8) * 40;
			const jitter = index % 5 * .75;
			return Math.max(baseHeight, dynamicHeight + jitter);
		})).map((height, index) => ({
			id: `wave-bar-${index}`,
			height,
			delay: index * .15
		}));
	})();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyMotion, {
		features: domAnimation,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `flex items-center justify-center gap-1.5 h-12 ${className || ""}`,
			children: bars.map((bar) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m.div, {
				className: "w-2 bg-primary rounded-full transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none",
				animate: getWaveformAnimateProps(isActive, bar.height),
				transition: getWaveformTransitionProps(bar.delay)
			}, bar.id))
		})
	});
}
//#endregion
//#region src/shared/ui/voice-input.tsx
function VoiceInputButton({ onTranscript, onInterimTranscript, disabled = false, className, variant = "inline", showWaveform = false }) {
	const onTranscriptRef = (0, import_react.useRef)(onTranscript);
	(0, import_react.useEffect)(() => {
		onTranscriptRef.current = onTranscript;
	}, [onTranscript]);
	const onInterimRef = (0, import_react.useRef)(onInterimTranscript);
	(0, import_react.useEffect)(() => {
		onInterimRef.current = onInterimTranscript;
	}, [onInterimTranscript]);
	const handleResult = (transcript) => {
		onTranscriptRef.current(transcript);
	};
	const { isSupported, isListening, toggleListening, transcript, error: voiceError, timeRemaining, clearError } = useVoiceInput({ onResult: handleResult });
	(0, import_react.useEffect)(() => {
		if (transcript && isListening && onInterimRef.current) onInterimRef.current(transcript);
	}, [transcript, isListening]);
	if (!isSupported) return null;
	if (variant === "inline") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center gap-2", className),
		children: [showWaveform && isListening && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceWaveform, {
			isActive: isListening,
			barCount: 8,
			className: "h-8"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			size: "sm",
			variant: isListening ? "destructive" : "ghost",
			onClick: toggleListening,
			disabled,
			className: cn("size-7 p-0", interactiveTransitionClass, isListening && "animate-pulse"),
			title: isListening ? `Stop listening (${timeRemaining}s)` : "Start voice input",
			"aria-label": isListening ? `Stop voice input${timeRemaining !== null ? `, ${timeRemaining} seconds left` : ""}` : "Start voice input",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-3.5" })
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col items-center", className),
		children: [
			showWaveform && isListening && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceWaveform, { isActive: isListening }), timeRemaining !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: [timeRemaining, "s remaining"]
				})]
			}),
			voiceError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-center gap-2 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-destructive flex-1",
					children: voiceError
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: clearError,
					className: "h-6 px-2 text-xs",
					children: "Dismiss"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: isListening ? "destructive" : "outline",
				size: "icon",
				onClick: toggleListening,
				disabled,
				className: cn("size-10 shrink-0 rounded-full", interactiveTransitionClass, isListening && "animate-pulse ring-2 ring-destructive/50"),
				title: isListening ? `Stop listening (${timeRemaining}s)` : "Start voice input",
				"aria-label": isListening ? `Stop voice input${timeRemaining !== null ? `, ${timeRemaining} seconds left` : ""}` : "Start voice input",
				children: isListening ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-4" })
			})
		]
	});
}
//#endregion
export { hasHighlightTerms as C, uploadStorageFile as D, LazyImage as E, uploadStorageFileWithPublicUrl as O, formatConversationSnippet as S, ImagePreviewModal as T, normalizeTeamMembers as _, AttachmentKindIcon as a, CHAT_MARKDOWN_CLASS as b, CHANNEL_TYPE_COLORS as c, buildCollaborationDmShareUrl as d, collectSharedFiles as f, isLikelyImageUrl as g, getInitials as h, ChatTypingIndicator as i, aggregateTeamMembers as l, formatRelativeTime as m, useVoiceInput as n, ChatMediaGallery as o, extractUrlsFromContent as p, Textarea as r, getAttachmentKind as s, VoiceInputButton as t, buildCollaborationChannelShareUrl as u, CHAT_CONVERSATION_ROW_CLASS as v, highlightText as w, CHAT_MESSAGE_BODY_CLASS as x, CHAT_LIST_PREVIEW_CLASS as y };
