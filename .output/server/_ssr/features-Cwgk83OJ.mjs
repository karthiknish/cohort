import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, c as useConvex, l as useMutation, s as useAction, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { h as getPreviewAdminFeatures } from "./preview-data-CXkRNfsX.mjs";
import { S as validateFile, c as cn } from "./utils-hh4sibN0.mjs";
import { a as chromaticTransitionClass } from "./motion-Cf6ujF0h.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { t as Skeleton } from "./skeleton-CQ4LJS0E.mjs";
import { s as logError, t as asErrorMessage } from "./convex-errors-sHK0JmZ7.mjs";
import { a as notifyInfo, c as reportConvexFailure, i as notifyFailure, o as notifySuccess } from "./notifications-DQZKskhM.mjs";
import { n as api } from "./rate-limiter-convex-Dr72h9nD.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { D as filesApi } from "./convex-api-msEHRhRb.mjs";
import { F as Sparkles, Rn as ExternalLink, Yt as LoaderCircle, fn as Image, g as Upload, gt as Pencil, i as X, lt as Plus, nn as Lightbulb, pn as ImagePlus, rt as RefreshCw, tn as Link2, w as Trash2, yn as GripVertical, zn as Ellipsis } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cuo0TTXb.mjs";
import { a as DialogFooter, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-C8tBdgAy.mjs";
import { t as Input } from "./input-DuOB9ezo.mjs";
import { t as Label } from "./label-B_FvRq1I.mjs";
import { c as getSemanticBadgeStyle, l as getStatusColor, s as getPriorityColor } from "./colors-DH3BrJD1.mjs";
import { r as useConvexQueryError } from "./use-convex-query-error-P2IX7lhG.mjs";
import { t as Textarea } from "./textarea-C0M2IvQZ.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-Be-Tzxcj.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as PageSkeletonBoundary } from "./page-skeleton-boundary-ZBP950Us.mjs";
import { c as DropdownMenuSeparator, i as DropdownMenuItem, l as DropdownMenuTrigger, r as DropdownMenuContent, t as DropdownMenu } from "./dropdown-menu-CJEJ0oqe.mjs";
import { t as AdminPageShell } from "./admin-page-shell-DKKo3NPm.mjs";
import { t as uploadStorageFile } from "./upload-storage-file-CUAnugSD.mjs";
import { t as LazyImage } from "./lazy-image-69k9UCD2.mjs";
import { t as AdminQueryErrorAlert } from "./admin-query-error-alert-Clikw_eH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/features-Cwgk83OJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Feature planning types for Kanban board in admin section
*/
var FEATURE_STATUSES = [
	"backlog",
	"planned",
	"in_progress",
	"completed"
];
var FEATURE_PRIORITIES = [
	"low",
	"medium",
	"high"
];
var FEATURE_STATUS_LABELS = {
	backlog: "Backlog",
	planned: "Planned",
	in_progress: "In Progress",
	completed: "Completed"
};
var FEATURE_PRIORITY_LABELS = {
	low: "Low",
	medium: "Medium",
	high: "High"
};
function getFeatureStatusBadgeStyle(status) {
	return getSemanticBadgeStyle(getStatusColor(status));
}
function getFeaturePriorityBadgeStyle(priority) {
	return getSemanticBadgeStyle(getPriorityColor(priority), .08);
}
function FeatureCard({ feature, onEdit, onDelete, isDragging = false }) {
	const handleEditClick = () => {
		onEdit(feature);
	};
	const handleDeleteClick = () => {
		onDelete(feature);
	};
	const handleReferenceClick = (event) => {
		event.stopPropagation();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("group relative flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm motion-chromatic", "hover:border-accent/30 hover:shadow-md", isDragging && "opacity-50 rotate-2 shadow-lg"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "size-4 text-muted-foreground" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2 pl-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "font-semibold text-foreground line-clamp-2 text-sm",
					children: feature.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "size-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
					align: "end",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							onClick: handleEditClick,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-2 size-4" }), "Edit"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							onClick: handleDeleteClick,
							className: "text-destructive focus:text-destructive",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 size-4" }), "Delete"]
						})
					]
				})] })]
			}),
			feature.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative aspect-video w-full overflow-hidden rounded-md bg-muted ml-4 mr-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyImage, {
					src: feature.imageUrl,
					alt: feature.title,
					className: "size-full object-cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" })]
			}),
			feature.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground line-clamp-2 pl-4",
				children: feature.description
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2 pl-4 pt-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					className: "h-5 px-1.5 py-0 text-[10px]",
					style: getFeaturePriorityBadgeStyle(feature.priority),
					children: FEATURE_PRIORITY_LABELS[feature.priority]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-muted-foreground",
					children: [feature.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-0.5",
						title: "Has image",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "size-3" })
					}), feature.references.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-0.5",
						title: `${feature.references.length} reference(s)`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px]",
							children: feature.references.length
						})]
					})]
				})]
			}),
			feature.references.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-1 pl-4 pt-1 border-t border-border/50",
				children: [feature.references.slice(0, 2).map((ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: ref.url,
					target: "_blank",
					rel: "noopener noreferrer",
					className: "inline-flex items-center gap-1 text-[10px] text-primary hover:underline max-w-[120px] truncate",
					onClick: handleReferenceClick,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-2.5 shrink-0" }), ref.label]
				}, `${ref.url}-${ref.label}`)), feature.references.length > 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-[10px] text-muted-foreground",
					children: [
						"+",
						feature.references.length - 2,
						" more"
					]
				})]
			})
		]
	});
}
function FeatureKanbanBoard({ features, onAddFeature, onEditFeature, onDeleteFeature, onMoveFeature }) {
	const [draggedFeature, setDraggedFeature] = (0, import_react.useState)(null);
	const [dragOverColumn, setDragOverColumn] = (0, import_react.useState)(null);
	const getFeaturesByStatus = (status) => features.filter((f) => f.status === status);
	const handleDragStart = (e, feature) => {
		setDraggedFeature(feature);
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", feature.id);
	};
	const handleDragEnd = () => {
		setDraggedFeature(null);
		setDragOverColumn(null);
	};
	const handleDragOver = (e, status) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		setDragOverColumn(status);
	};
	const handleDragLeave = () => {
		setDragOverColumn(null);
	};
	const handleDrop = (e, targetStatus) => {
		e.preventDefault();
		const featureId = e.dataTransfer.getData("text/plain");
		if (featureId && draggedFeature && draggedFeature.status !== targetStatus) onMoveFeature(featureId, targetStatus);
		setDraggedFeature(null);
		setDragOverColumn(null);
	};
	const handleAddFeatureClick = (status) => {
		onAddFeature(status);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4",
		children: FEATURE_STATUSES.map((status) => {
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureKanbanColumn, {
				status,
				features: getFeaturesByStatus(status),
				isDropTarget: dragOverColumn === status,
				isDraggedFromThis: draggedFeature?.status === status,
				draggedFeature,
				handleDragOver,
				handleDragLeave,
				handleDrop,
				handleDragStart,
				handleDragEnd,
				onEditFeature,
				onDeleteFeature,
				onAddFeature: handleAddFeatureClick
			}, status);
		})
	});
}
function FeatureKanbanColumn({ status, features, isDropTarget, isDraggedFromThis, draggedFeature, handleDragOver, handleDragLeave, handleDrop, handleDragStart, handleDragEnd, onEditFeature, onDeleteFeature, onAddFeature }) {
	const handleColumnDragOver = (e) => {
		handleDragOver(e, status);
	};
	const handleColumnDrop = (e) => {
		handleDrop(e, status);
	};
	const handleAddClick = () => {
		onAddFeature(status);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		onDragOver: handleColumnDragOver,
		onDragLeave: handleDragLeave,
		onDrop: handleColumnDrop,
		className: cn("flex flex-col rounded-xl border bg-muted/30 min-h-[500px]", chromaticTransitionClass, isDropTarget && !isDraggedFromThis && "border-primary bg-accent/5 ring-2 ring-primary/20"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
						style: getFeatureStatusBadgeStyle(status),
						children: FEATURE_STATUS_LABELS[status]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: features.length
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: "size-7",
					onClick: handleAddClick,
					"aria-label": `Add feature to ${FEATURE_STATUS_LABELS[status]} column`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
						className: "size-4",
						"aria-hidden": true
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 space-y-3 overflow-y-auto p-3",
				children: features.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "No features"
					})
				}) : features.map((feature) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureKanbanDraggableItem, {
					feature,
					draggedFeatureId: draggedFeature?.id,
					handleDragStart,
					handleDragEnd,
					onEditFeature,
					onDeleteFeature
				}, feature.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t p-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					className: "w-full justify-start gap-2 text-muted-foreground hover:text-foreground",
					onClick: handleAddClick,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Add feature"]
				})
			})
		]
	});
}
function FeatureKanbanDraggableItem({ feature, draggedFeatureId, handleDragStart, handleDragEnd, onEditFeature, onDeleteFeature }) {
	const handleStart = (e) => {
		handleDragStart(e, feature);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		draggable: true,
		onDragStart: handleStart,
		onDragEnd: handleDragEnd,
		className: "cursor-grab active:cursor-grabbing",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureCard, {
			feature,
			onEdit: onEditFeature,
			onDelete: onDeleteFeature,
			isDragging: draggedFeatureId === feature.id
		})
	});
}
function ImageUploader({ value, onChange, onUpload, className, disabled = false, maxSizeMB = 5, placeholder = "Upload an image" }) {
	const inputRef = (0, import_react.useRef)(null);
	const [isUploading, setIsUploading] = (0, import_react.useState)(false);
	const [isDragging, setIsDragging] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [previewUrl, setPreviewUrl] = (0, import_react.useState)(value ?? null);
	const maxSizeBytes = maxSizeMB * 1024 * 1024;
	const onOpenFilePicker = () => {
		if (!disabled && !isUploading) inputRef.current?.click();
	};
	const validateFile = (file) => {
		if (!file.type.startsWith("image/")) return "Please select an image file (PNG, JPG, WebP, or GIF)";
		if (file.size > maxSizeBytes) return `Image must be smaller than ${maxSizeMB}MB`;
		return null;
	};
	const processFile = (file) => {
		const validationError = validateFile(file);
		if (validationError) {
			setError(validationError);
			return;
		}
		setError(null);
		setIsUploading(true);
		const objectUrl = URL.createObjectURL(file);
		setPreviewUrl(objectUrl);
		onUpload(file).then((uploadedUrl) => {
			URL.revokeObjectURL(objectUrl);
			setPreviewUrl(uploadedUrl);
			onChange(uploadedUrl);
		}).catch((err) => {
			logError(err, "image-uploader:upload");
			const message = asErrorMessage(err);
			setError("Upload failed. Please try again.");
			notifyFailure({
				title: "Upload failed",
				message
			});
			URL.revokeObjectURL(objectUrl);
			setPreviewUrl(value ?? null);
		}).finally(() => {
			setIsUploading(false);
		});
	};
	const handleFileChange = (event) => {
		const file = event.target.files?.[0];
		if (file) processFile(file);
		event.target.value = "";
	};
	const handleDragOver = (event) => {
		event.preventDefault();
		event.stopPropagation();
		setIsDragging(true);
	};
	const handleDragLeave = (event) => {
		event.preventDefault();
		event.stopPropagation();
		setIsDragging(false);
	};
	const handleDrop = (event) => {
		event.preventDefault();
		event.stopPropagation();
		setIsDragging(false);
		if (disabled || isUploading) return;
		const file = event.dataTransfer.files?.[0];
		if (file) processFile(file);
	};
	const handleRemove = () => {
		if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
		setPreviewUrl(null);
		onChange(null);
		setError(null);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-2", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: inputRef,
				type: "file",
				accept: "image/png,image/jpeg,image/jpg,image/webp,image/gif",
				"aria-label": "Upload image",
				className: "hidden",
				onChange: handleFileChange,
				disabled: disabled || isUploading
			}),
			previewUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative group",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyImage, {
						src: previewUrl,
						alt: "Feature preview",
						className: "size-full object-cover"
					}), isUploading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 flex items-center justify-center bg-background/80",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-8 animate-spin text-primary" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute top-2 right-2 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						size: "icon",
						className: "size-8 bg-background/90 hover:bg-background",
						onClick: onOpenFilePicker,
						disabled: disabled || isUploading,
						"aria-label": "Replace image",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {
							className: "size-4",
							"aria-hidden": true
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "destructive",
						size: "icon",
						className: "size-8",
						onClick: handleRemove,
						disabled: disabled || isUploading,
						"aria-label": "Remove image",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
							className: "size-4",
							"aria-hidden": true
						})
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onOpenFilePicker,
				onDragOver: handleDragOver,
				onDragLeave: handleDragLeave,
				onDrop: handleDrop,
				className: cn("flex flex-col items-center justify-center gap-2 p-6", "aspect-video w-full rounded-lg border-2 border-dashed", "cursor-pointer transition-colors", isDragging ? "border-primary bg-accent/5" : "border-muted-foreground/25 hover:border-accent/50 hover:bg-muted/50", (disabled || isUploading) && "cursor-not-allowed opacity-50"),
				children: [isUploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-8 animate-spin text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-8 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-foreground",
						children: isUploading ? "Uploading…" : placeholder
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Drag and drop or click to browse"
					})]
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-destructive",
				children: error
			})
		]
	});
}
function FeatureReferenceRow({ loading, onRemove, reference, index }) {
	const handleRemove = () => onRemove(index);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			href: reference.url,
			target: "_blank",
			rel: "noopener noreferrer",
			className: "flex-1 truncate text-sm text-primary hover:underline",
			children: reference.label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "ghost",
			size: "icon",
			className: "size-6 shrink-0",
			onClick: handleRemove,
			disabled: loading,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
		})]
	});
}
function FeatureFormDialogBody(props) {
	const { isEditing, isSubmitting, isGeneratingTitle, isGeneratingDescription, title, description, status, priority, imageUrl, references, newRefUrl, newRefLabel, handleUploadImage, handleAddReference, handleRemoveReference, handleTitleChange, handleDescriptionChange, handleStatusChange, handlePriorityChange, handleNewRefUrlChange, handleNewRefLabelChange, handleImageUrlChange, handleGenerateTitleClick, handleGenerateDescriptionClick, handleClose, handleSubmit } = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: "max-w-2xl max-h-[90vh] overflow-y-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isEditing ? "Edit Feature" : "Add Feature" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: isEditing ? "Update the feature details below." : "Add a new feature to your planning board." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "feature-title",
							children: "Title *"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "ghost",
							size: "sm",
							className: "h-7 gap-1.5 text-xs text-muted-foreground hover:text-primary",
							onClick: handleGenerateTitleClick,
							disabled: isSubmitting || isGeneratingTitle,
							children: [isGeneratingTitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }), "AI Generate"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "feature-title",
						value: title,
						onChange: handleTitleChange,
						placeholder: "e.g., User Authentication System",
						disabled: isSubmitting || isGeneratingTitle
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "feature-description",
							children: "Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "ghost",
							size: "sm",
							className: "h-7 gap-1.5 text-xs text-muted-foreground hover:text-primary",
							onClick: handleGenerateDescriptionClick,
							disabled: isSubmitting || isGeneratingDescription,
							children: [isGeneratingDescription ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }), "AI Generate"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "feature-description",
						value: description,
						onChange: handleDescriptionChange,
						placeholder: "Describe what this feature should accomplish…",
						rows: 3,
						disabled: isSubmitting || isGeneratingDescription
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "feature-status",
							children: "Status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: status,
							onValueChange: handleStatusChange,
							disabled: isSubmitting,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "feature-status",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: FEATURE_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: s,
								children: FEATURE_STATUS_LABELS[s]
							}, s)) })]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "feature-priority",
							children: "Priority"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: priority,
							onValueChange: handlePriorityChange,
							disabled: isSubmitting,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								id: "feature-priority",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: FEATURE_PRIORITIES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: p,
								children: FEATURE_PRIORITY_LABELS[p]
							}, p)) })]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Feature Image / Mockup" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUploader, {
						value: imageUrl,
						onChange: handleImageUrlChange,
						onUpload: handleUploadImage,
						placeholder: "Upload a mockup or screenshot",
						disabled: isSubmitting
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Reference Links" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Add links to inspiration, documentation, or requirements."
						}),
						references.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: references.map((reference, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureReferenceRow, {
								loading: isSubmitting,
								onRemove: handleRemoveReference,
								reference,
								index
							}, `${reference.url}-${reference.label}`))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "https://example.com",
									value: newRefUrl,
									onChange: handleNewRefUrlChange,
									disabled: isSubmitting,
									className: "flex-1"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "Label (optional)",
									value: newRefLabel,
									onChange: handleNewRefLabelChange,
									disabled: isSubmitting,
									className: "w-32"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "icon",
									onClick: handleAddReference,
									disabled: isSubmitting || !newRefUrl.trim(),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					onClick: handleClose,
					disabled: isSubmitting,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "submit",
					disabled: isSubmitting,
					children: [isSubmitting && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), isEditing ? "Save Changes" : "Add Feature"]
				})] })
			]
		})]
	});
}
function FeatureFormDialogShell({ open, onOpenChange, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children
	});
}
function createEmptyFeatureFormState(defaultStatus) {
	return {
		isSubmitting: false,
		isGeneratingTitle: false,
		isGeneratingDescription: false,
		title: "",
		description: "",
		status: defaultStatus,
		priority: "medium",
		imageUrl: null,
		references: [],
		newRefUrl: "",
		newRefLabel: ""
	};
}
function featureFormReducer(state, action) {
	switch (action.type) {
		case "reset":
			if (action.feature) return {
				...createEmptyFeatureFormState(action.defaultStatus),
				title: action.feature.title,
				description: action.feature.description,
				status: action.feature.status,
				priority: action.feature.priority,
				imageUrl: action.feature.imageUrl ?? null,
				references: action.feature.references ?? []
			};
			return createEmptyFeatureFormState(action.defaultStatus);
		case "setIsSubmitting": return {
			...state,
			isSubmitting: action.value
		};
		case "setGeneratingTitle": return {
			...state,
			isGeneratingTitle: action.value
		};
		case "setGeneratingDescription": return {
			...state,
			isGeneratingDescription: action.value
		};
		case "setTitle": return {
			...state,
			title: action.value
		};
		case "setDescription": return {
			...state,
			description: action.value
		};
		case "setStatus": return {
			...state,
			status: action.value
		};
		case "setPriority": return {
			...state,
			priority: action.value
		};
		case "setImageUrl": return {
			...state,
			imageUrl: action.value
		};
		case "setReferences": return {
			...state,
			references: action.value
		};
		case "addReference": return {
			...state,
			references: [...state.references, action.reference],
			newRefUrl: "",
			newRefLabel: ""
		};
		case "removeReference": return {
			...state,
			references: state.references.filter((_, i) => i !== action.index)
		};
		case "setNewRefUrl": return {
			...state,
			newRefUrl: action.value
		};
		case "setNewRefLabel": return {
			...state,
			newRefLabel: action.value
		};
		case "clearNewReferenceInputs": return {
			...state,
			newRefUrl: "",
			newRefLabel: ""
		};
		default: return state;
	}
}
function useFeatureFormDialog({ open, onOpenChange, feature, defaultStatus = "backlog", onSubmit }) {
	const { isPreviewMode } = usePreview();
	const { user } = useAuth();
	const convex = useConvex();
	const [state, dispatch] = (0, import_react.useReducer)(featureFormReducer, createEmptyFeatureFormState(defaultStatus));
	const { isSubmitting, isGeneratingTitle, isGeneratingDescription, title, description, status, priority, imageUrl, references, newRefUrl, newRefLabel } = state;
	const generateFeatureAi = useAction(api.adminFeaturesAi.generate);
	const generateUploadUrl = useMutation(filesApi.generateUploadUrl);
	const syncMetadata = useMutation(filesApi.syncMetadata);
	const getPublicUrl = (args) => convex.query(filesApi.getPublicUrl, {
		workspaceId: user?.agencyId ?? "",
		storageId: args.storageId
	});
	const isEditing = !!feature;
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const frame = requestAnimationFrame(() => {
			dispatch({
				type: "reset",
				feature,
				defaultStatus
			});
		});
		return () => {
			cancelAnimationFrame(frame);
		};
	}, [
		open,
		feature,
		defaultStatus
	]);
	const handleUploadImage = async (file) => {
		const validation = validateFile(file, {
			allowedTypes: [
				"image/jpeg",
				"image/png",
				"image/webp",
				"image/gif"
			],
			maxSizeMb: 2
		});
		if (!validation.valid) throw new Error(validation.error || "Invalid image file");
		if (isPreviewMode) return URL.createObjectURL(file);
		const publicUrl = await getPublicUrl({ storageId: await uploadStorageFile({
			file,
			contentType: file.type || "application/octet-stream",
			generateUploadUrl: () => generateUploadUrl({}),
			syncMetadata: (args) => syncMetadata(args)
		}) });
		if (!publicUrl?.url) throw new Error("Unable to resolve uploaded file URL");
		return publicUrl.url;
	};
	const handleGenerateAI = (field) => {
		if (field === "title") dispatch({
			type: "setGeneratingTitle",
			value: true
		});
		else dispatch({
			type: "setGeneratingDescription",
			value: true
		});
		if (isPreviewMode) {
			const previewTitle = title.trim() || `${FEATURE_STATUS_LABELS[status]} ${FEATURE_PRIORITY_LABELS[priority]} initiative`;
			const previewDescription = description.trim() || `Sample feature brief: tighten the ${status.replace("_", " ")} workflow, improve stakeholder clarity, and keep the next release visible in the admin roadmap.`;
			if (field === "title") dispatch({
				type: "setTitle",
				value: previewTitle
			});
			else dispatch({
				type: "setDescription",
				value: previewDescription
			});
			notifyInfo({
				title: "Preview mode",
				message: `Sample ${field} generated locally for this feature.`
			});
			dispatch({
				type: "setGeneratingTitle",
				value: false
			});
			dispatch({
				type: "setGeneratingDescription",
				value: false
			});
			return;
		}
		generateFeatureAi({
			field,
			context: {
				currentTitle: title,
				currentDescription: description,
				status,
				priority
			}
		}).then((data) => {
			if (field === "title" && data.title) {
				dispatch({
					type: "setTitle",
					value: data.title
				});
				notifySuccess({
					title: "Title generated",
					message: "AI has suggested a title for your feature."
				});
			} else if (field === "description" && data.description) {
				dispatch({
					type: "setDescription",
					value: data.description
				});
				notifySuccess({
					title: "Description generated",
					message: "AI has suggested a description for your feature."
				});
			}
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "FeatureFormDialog:generateFeatureAi",
				title: "Generation failed",
				fallbackMessage: "Generation failed"
			});
		}).finally(() => {
			dispatch({
				type: "setGeneratingTitle",
				value: false
			});
			dispatch({
				type: "setGeneratingDescription",
				value: false
			});
		});
	};
	const handleAddReference = () => {
		const trimmedUrl = newRefUrl.trim();
		if (!trimmedUrl) return;
		if (!URL.canParse(trimmedUrl)) {
			notifyFailure({
				title: "Invalid URL",
				message: "Please enter a valid URL"
			});
			return;
		}
		const parsedUrl = new URL(trimmedUrl);
		dispatch({
			type: "addReference",
			reference: {
				url: trimmedUrl,
				label: newRefLabel.trim() || parsedUrl.hostname
			}
		});
	};
	const handleRemoveReference = (index) => {
		dispatch({
			type: "removeReference",
			index
		});
	};
	const handleTitleChange = (event) => {
		dispatch({
			type: "setTitle",
			value: event.target.value
		});
	};
	const handleDescriptionChange = (event) => {
		dispatch({
			type: "setDescription",
			value: event.target.value
		});
	};
	const handleStatusChange = (value) => {
		dispatch({
			type: "setStatus",
			value
		});
	};
	const handlePriorityChange = (value) => {
		dispatch({
			type: "setPriority",
			value
		});
	};
	const handleNewRefUrlChange = (event) => {
		dispatch({
			type: "setNewRefUrl",
			value: event.target.value
		});
	};
	const handleNewRefLabelChange = (event) => {
		dispatch({
			type: "setNewRefLabel",
			value: event.target.value
		});
	};
	const handleImageUrlChange = (value) => {
		dispatch({
			type: "setImageUrl",
			value
		});
	};
	const handleGenerateTitleClick = () => {
		handleGenerateAI("title");
	};
	const handleGenerateDescriptionClick = () => {
		handleGenerateAI("description");
	};
	const handleClose = () => {
		onOpenChange(false);
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!title.trim()) {
			notifyFailure({
				title: "Title required",
				message: "Please enter a feature title"
			});
			return;
		}
		dispatch({
			type: "setIsSubmitting",
			value: true
		});
		onSubmit({
			title: title.trim(),
			description: description.trim(),
			status,
			priority,
			imageUrl,
			references
		}).then(() => {
			onOpenChange(false);
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "FeatureFormDialog:handleSubmit",
				title: "Save failed",
				fallbackMessage: "Save failed"
			});
		}).finally(() => {
			dispatch({
				type: "setIsSubmitting",
				value: false
			});
		});
	};
	return {
		isEditing,
		isSubmitting,
		isGeneratingTitle,
		isGeneratingDescription,
		title,
		description,
		status,
		priority,
		imageUrl,
		references,
		newRefUrl,
		newRefLabel,
		handleUploadImage,
		handleAddReference,
		handleRemoveReference,
		handleTitleChange,
		handleDescriptionChange,
		handleStatusChange,
		handlePriorityChange,
		handleNewRefUrlChange,
		handleNewRefLabelChange,
		handleImageUrlChange,
		handleGenerateTitleClick,
		handleGenerateDescriptionClick,
		handleClose,
		handleSubmit
	};
}
function FeatureFormDialog(props) {
	const form = useFeatureFormDialog(props);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureFormDialogShell, {
		open: props.open,
		onOpenChange: props.onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureFormDialogBody, { ...form })
	});
}
function AdminFeaturesToolbarActions({ refreshing, onRefresh }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		variant: "outline",
		size: "sm",
		onClick: onRefresh,
		disabled: refreshing,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
			className: cn("mr-2 size-4", refreshing && "animate-spin"),
			"aria-hidden": true
		}), "Refresh"]
	});
}
function AdminFeaturesLoadingShell() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPageShell, {
		title: "Feature planning",
		description: "Loading the platform backlog…",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 lg:grid-cols-4",
			children: [
				"skeleton-a",
				"skeleton-b",
				"skeleton-c",
				"skeleton-d"
			].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 rounded-lg border border-border/60 bg-card/50 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-24" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full rounded-md" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full rounded-md" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full rounded-md" })
					]
				})]
			}, key))
		})
	});
}
function AdminFeaturesDeleteDialog({ open, featureToDelete, isDeleting, onOpenChange, onConfirm }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete Feature" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
			"Are you sure you want to delete \"",
			featureToDelete?.title,
			"\"? This action cannot be undone."
		] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
			disabled: isDeleting,
			children: "Cancel"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogAction, {
			onClick: onConfirm,
			disabled: isDeleting,
			className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			children: [isDeleting && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Delete"]
		})] })] })
	});
}
function AdminFeaturesPageContent({ isPreviewMode, features, featuresQueryError, refreshing, formDialogOpen, editingFeature, defaultStatus, deleteConfirmOpen, featureToDelete, isDeleting, onRefresh, onAddFeature, onEditFeature, onDeleteFeature, onFormDialogOpenChange, onDeleteConfirmOpenChange, onConfirmDelete, onMoveFeature, onSubmitFeature }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminPageShell, {
			title: "Feature planning",
			description: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Plan and track platform features on a visual Kanban board.", isPreviewMode ? " Preview mode uses a local sample backlog." : ""] }),
			isPreviewMode,
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminFeaturesToolbarActions, {
				refreshing,
				onRefresh
			}),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminQueryErrorAlert, {
					error: featuresQueryError,
					title: "Unable to load features"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center gap-2 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-8 items-center justify-center rounded-md bg-accent/10 text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "size-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Drag cards between columns or open a card to edit details." })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureKanbanBoard, {
					features,
					onAddFeature,
					onEditFeature,
					onDeleteFeature,
					onMoveFeature
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureFormDialog, {
			open: formDialogOpen,
			onOpenChange: onFormDialogOpenChange,
			feature: editingFeature,
			defaultStatus,
			onSubmit: onSubmitFeature
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminFeaturesDeleteDialog, {
			open: deleteConfirmOpen,
			featureToDelete,
			isDeleting,
			onOpenChange: onDeleteConfirmOpenChange,
			onConfirm: onConfirmDelete
		})
	] });
}
function toFeatureDocId(value) {
	return value;
}
function createInitialAdminFeaturesState() {
	return {
		refreshing: false,
		previewFeatures: getPreviewAdminFeatures(),
		formDialogOpen: false,
		editingFeature: null,
		defaultStatus: "backlog",
		deleteConfirmOpen: false,
		featureToDelete: null,
		isDeleting: false
	};
}
function adminFeaturesReducer(state, action) {
	switch (action.type) {
		case "setRefreshing": return {
			...state,
			refreshing: action.value
		};
		case "setPreviewFeatures": return {
			...state,
			previewFeatures: action.value
		};
		case "updatePreviewFeatures": return {
			...state,
			previewFeatures: action.updater(state.previewFeatures)
		};
		case "openFormDialog": return {
			...state,
			formDialogOpen: true,
			editingFeature: action.editingFeature,
			defaultStatus: action.defaultStatus
		};
		case "setFormDialogOpen": return {
			...state,
			formDialogOpen: action.value
		};
		case "openDeleteConfirm": return {
			...state,
			deleteConfirmOpen: true,
			featureToDelete: action.feature
		};
		case "closeDeleteConfirm": return {
			...state,
			deleteConfirmOpen: false,
			featureToDelete: null,
			isDeleting: false
		};
		case "setIsDeleting": return {
			...state,
			isDeleting: action.value
		};
		default: return state;
	}
}
function useAdminFeaturesPage() {
	const { isPreviewMode } = usePreview();
	const [state, dispatch] = (0, import_react.useReducer)(adminFeaturesReducer, void 0, createInitialAdminFeaturesState);
	const { refreshing, previewFeatures, formDialogOpen, editingFeature, defaultStatus, deleteConfirmOpen, featureToDelete, isDeleting } = state;
	const featuresResponse = useQuery(api.adminFeatures.listFeatures, isPreviewMode ? "skip" : {});
	const createFeature = useMutation(api.adminFeatures.createFeature);
	const updateFeature = useMutation(api.adminFeatures.updateFeature);
	const deleteFeature = useMutation(api.adminFeatures.deleteFeature);
	const features = (() => {
		if (isPreviewMode) return previewFeatures;
		return (featuresResponse?.features ?? []).map((row) => ({
			id: row.id,
			title: row.title,
			description: row.description,
			status: row.status,
			priority: row.priority,
			imageUrl: row.imageUrl,
			references: row.references,
			createdAt: new Date(row.createdAtMs).toISOString(),
			updatedAt: new Date(row.updatedAtMs).toISOString()
		}));
	})();
	const loading = isPreviewMode ? false : featuresResponse === void 0;
	const featuresQueryError = useConvexQueryError({
		data: featuresResponse,
		skipped: isPreviewMode,
		loading,
		fallbackMessage: "Unable to load the feature backlog."
	});
	const fetchFeatures = async (isRefresh = false) => {
		if (!isRefresh) return;
		dispatch({
			type: "setRefreshing",
			value: true
		});
		if (isPreviewMode) {
			dispatch({
				type: "setPreviewFeatures",
				value: getPreviewAdminFeatures()
			});
			setTimeout(() => dispatch({
				type: "setRefreshing",
				value: false
			}), 250);
			return;
		}
		setTimeout(() => dispatch({
			type: "setRefreshing",
			value: false
		}), 400);
	};
	const handleRefresh = () => {
		fetchFeatures(true);
	};
	const handleAddFeature = (status) => {
		dispatch({
			type: "openFormDialog",
			editingFeature: null,
			defaultStatus: status
		});
	};
	const handleEditFeature = (feature) => {
		dispatch({
			type: "openFormDialog",
			editingFeature: feature,
			defaultStatus: feature.status
		});
	};
	const handleDeleteFeature = (feature) => {
		dispatch({
			type: "openDeleteConfirm",
			feature
		});
	};
	const handleFormDialogOpenChange = (open) => {
		dispatch({
			type: "setFormDialogOpen",
			value: open
		});
	};
	const handleDeleteConfirmOpenChange = (open) => {
		if (!open) dispatch({ type: "closeDeleteConfirm" });
	};
	const confirmDelete = () => {
		if (!featureToDelete) return;
		if (isPreviewMode) {
			dispatch({
				type: "updatePreviewFeatures",
				updater: (current) => current.filter((feature) => feature.id !== featureToDelete.id)
			});
			notifyInfo({
				title: "Preview mode",
				message: "Sample feature removed locally for this session."
			});
			dispatch({ type: "closeDeleteConfirm" });
			return;
		}
		dispatch({
			type: "setIsDeleting",
			value: true
		});
		deleteFeature({ id: toFeatureDocId(featureToDelete.id) }).then(() => {
			notifySuccess({
				title: "Feature deleted",
				message: "The feature has been removed from the board."
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "AdminFeaturesPage:confirmDelete",
				title: "Delete failed",
				fallbackMessage: "Delete failed"
			});
		}).finally(() => {
			dispatch({ type: "closeDeleteConfirm" });
		});
	};
	const handleMoveFeature = (featureId, newStatus) => {
		const feature = features.find((f) => f.id === featureId);
		if (!feature || feature.status === newStatus) return;
		if (isPreviewMode) {
			dispatch({
				type: "updatePreviewFeatures",
				updater: (current) => current.map((item) => item.id === featureId ? {
					...item,
					status: newStatus,
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				} : item)
			});
			notifyInfo({
				title: "Preview mode",
				message: `Sample feature moved to ${newStatus.replace("_", " ")}.`
			});
			return;
		}
		updateFeature({
			id: toFeatureDocId(featureId),
			status: newStatus
		}).then(() => {
			notifySuccess({
				title: "Status updated",
				message: `Feature moved to ${newStatus.replace("_", " ")}.`
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "AdminFeaturesPage:handleMoveFeature",
				title: "Move failed",
				fallbackMessage: "Unable to update feature status."
			});
		});
	};
	const handleSubmitFeature = (data) => {
		if (isPreviewMode) return Promise.resolve().then(() => {
			if (editingFeature) dispatch({
				type: "updatePreviewFeatures",
				updater: (current) => current.map((feature) => feature.id === editingFeature.id ? {
					...feature,
					title: data.title,
					description: data.description,
					status: data.status,
					priority: data.priority,
					imageUrl: data.imageUrl,
					references: data.references,
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				} : feature)
			});
			else dispatch({
				type: "updatePreviewFeatures",
				updater: (current) => [{
					id: `preview-feature-${Date.now()}`,
					title: data.title,
					description: data.description,
					status: data.status,
					priority: data.priority,
					imageUrl: data.imageUrl,
					references: data.references,
					createdAt: (/* @__PURE__ */ new Date()).toISOString(),
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				}, ...current]
			});
			notifyInfo({
				title: editingFeature ? "Preview feature updated" : "Preview feature added",
				message: "Changes apply only to the sample board in this session."
			});
		});
		return (editingFeature ? updateFeature({
			id: toFeatureDocId(editingFeature.id),
			title: data.title,
			description: data.description,
			status: data.status,
			priority: data.priority,
			imageUrl: data.imageUrl,
			references: data.references
		}) : createFeature({
			title: data.title,
			description: data.description,
			status: data.status,
			priority: data.priority,
			imageUrl: data.imageUrl,
			references: data.references
		})).then(() => {
			notifySuccess({
				title: editingFeature ? "Feature updated" : "Feature added",
				message: editingFeature ? "Your changes have been saved." : "The new feature has been added to the board."
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "AdminFeaturesPage:handleSubmitFeature",
				title: "Save failed",
				fallbackMessage: "Save failed"
			});
		});
	};
	return {
		isPreviewMode,
		loading,
		features,
		featuresQueryError,
		refreshing,
		formDialogOpen,
		editingFeature,
		defaultStatus,
		deleteConfirmOpen,
		featureToDelete,
		isDeleting,
		handleRefresh,
		handleAddFeature,
		handleEditFeature,
		handleDeleteFeature,
		handleFormDialogOpenChange,
		handleDeleteConfirmOpenChange,
		confirmDelete,
		handleMoveFeature,
		handleSubmitFeature
	};
}
function AdminFeaturesPage() {
	const page = useAdminFeaturesPage();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeletonBoundary, {
		loading: page.loading,
		loadingContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminFeaturesLoadingShell, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminFeaturesPageContent, {
			isPreviewMode: page.isPreviewMode,
			features: page.features,
			featuresQueryError: page.featuresQueryError,
			refreshing: page.refreshing,
			formDialogOpen: page.formDialogOpen,
			editingFeature: page.editingFeature,
			defaultStatus: page.defaultStatus,
			deleteConfirmOpen: page.deleteConfirmOpen,
			featureToDelete: page.featureToDelete,
			isDeleting: page.isDeleting,
			onRefresh: page.handleRefresh,
			onAddFeature: page.handleAddFeature,
			onEditFeature: page.handleEditFeature,
			onDeleteFeature: page.handleDeleteFeature,
			onFormDialogOpenChange: page.handleFormDialogOpenChange,
			onDeleteConfirmOpenChange: page.handleDeleteConfirmOpenChange,
			onConfirmDelete: page.confirmDelete,
			onMoveFeature: page.handleMoveFeature,
			onSubmitFeature: page.handleSubmitFeature
		})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminFeaturesPage, {});
//#endregion
export { SplitComponent as component };
