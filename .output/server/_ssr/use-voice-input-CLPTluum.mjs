import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { f as Overlay, h as Title, m as Root, p as Portal, u as Content } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { An as FileText, Dn as File, En as Film, Et as Music2, Mn as FileSpreadsheet, Mt as MonitorPlay, Pn as FileArchive, Rn as ExternalLink, Vn as Download, fn as Image, i as X, mr as ChevronLeft, n as ZoomIn, pr as ChevronRight, t as ZoomOut } from "../_libs/lucide-react.mjs";
import { i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-C8tBdgAy.mjs";
import { t as LazyImage } from "./lazy-image-69k9UCD2.mjs";
import { m as isLikelyImageUrl } from "./utils-DWnHfwOl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-voice-input-CLPTluum.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
function ImagePreviewModal(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePreviewModalDialog, { ...useImagePreviewModal(props) });
}
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
		default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(File, {
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
export { hasHighlightTerms as a, getAttachmentKind as i, ChatMediaGallery as n, highlightText as o, ImagePreviewModal as r, useVoiceInput as s, AttachmentKindIcon as t };
