import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, c as useConvex, l as useMutation, s as useAction, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { G as getPreviewSettingsProfile, K as getPreviewSettingsRegionalPreferences, U as getPreviewSettingsExportData, W as getPreviewSettingsNotificationPreferences, d as getCurrencyOptions, n as NOTIFICATION_CATEGORIES, o as SUPPORTED_CURRENCIES, r as POPULAR_CURRENCIES, s as applyPreferencesPatch, st as normalizePreferences, t as CATEGORY_LABELS } from "./preview-data-CXkRNfsX.mjs";
import { S as validateFile, c as cn } from "./utils-hh4sibN0.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { a as CardHeader, i as CardFooter, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CDBnK3ba.mjs";
import { s as logError, t as asErrorMessage } from "./convex-errors-sHK0JmZ7.mjs";
import { a as notifyInfo, c as reportConvexFailure, i as notifyFailure, o as notifySuccess } from "./notifications-DQZKskhM.mjs";
import { i as useSearchParams, r as useRouter$1 } from "./navigation-C1M-rNAu.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { D as filesApi, W as settingsApi, v as authActionsApi } from "./convex-api-msEHRhRb.mjs";
import { At as Moon, B as Shield, Ir as Bell, K as Settings2, Kt as Mail, L as Smartphone, P as SquareCheckBig, Rn as ExternalLink, Rt as MessageSquare, Sr as ChartColumn, Tn as FolderKanban, Vn as Download, Yt as LoaderCircle, f as User, jt as Monitor, k as Sun, pn as ImagePlus, w as Trash2, wr as Calendar, xn as Globe } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cuo0TTXb.mjs";
import { a as DialogFooter, i as DialogDescription, n as DialogClose, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-C8tBdgAy.mjs";
import { t as Input } from "./input-DuOB9ezo.mjs";
import { t as Label } from "./label-B_FvRq1I.mjs";
import { n as FadeInItem } from "./animate-in-JYv0iBIt.mjs";
import { a as TabsTrigger, i as TabsList, n as Tabs, r as TabsContent } from "./tabs-BP_mm-cH.mjs";
import { t as Separator } from "./separator-DGLaDYU_.mjs";
import { r as FieldDescription, s as FieldTitle } from "./field-BTH9SS9b.mjs";
import { n as FormField } from "./form-field-B6tt5YY-.mjs";
import { r as useConvexQueryError, t as mergeQueryErrors } from "./use-convex-query-error-P2IX7lhG.mjs";
import { n as AlertDescription, r as AlertTitle, t as Alert } from "./alert-DYeH1Q3p.mjs";
import { n as AvatarFallback, r as AvatarImage, t as Avatar } from "./avatar-DghqGd0Q.mjs";
import { t as ScrollArea } from "./scroll-area-DnXuhDTw.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { t as Switch } from "./switch-CFSWzNEX.mjs";
import { t as PageMotionShell } from "./page-motion-shell-Ci2leIYf.mjs";
import { r as usePreferences } from "./preferences-context-D6bi2pUb.mjs";
import { n as ProtectedRoute, r as WorkspaceProviders, t as AgentModeDynamic } from "./workspace-providers-BRcwzunN.mjs";
import { t as NavigationProvider } from "./navigation-context-BLXaFSSv.mjs";
import { t as uploadStorageFile } from "./upload-storage-file-CUAnugSD.mjs";
import { t as Route } from "./settings-b3y4-9SV.mjs";
import { n as z } from "../_libs/next-themes.mjs";
import { i as Sidebar, n as Header, r as NavigationBreadcrumbs } from "./breadcrumbs-j0-fuXNN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-DOW6JyDR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AppearanceSettingsCard() {
	const { theme, setTheme, resolvedTheme } = z();
	const currentTheme = theme ?? "system";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
		className: "text-base",
		children: "Appearance"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: ["Choose how Cohorts looks on this device.", resolvedTheme ? ` Currently using ${resolvedTheme} mode.` : null] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			htmlFor: "appearance-theme",
			children: "Theme"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
			value: currentTheme,
			onValueChange: setTheme,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
				id: "appearance-theme",
				className: "w-full max-w-xs",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select theme" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: "light",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {
							className: "size-4",
							"aria-hidden": true
						}), "Light"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: "dark",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, {
							className: "size-4",
							"aria-hidden": true
						}), "Dark"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: "system",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Monitor, {
							className: "size-4",
							"aria-hidden": true
						}), "System"]
					})
				})
			] })]
		})]
	})] });
}
function DataExportCard() {
	const { user } = useAuth();
	const { isPreviewMode } = usePreview();
	const [exportingData, setExportingData] = (0, import_react.useState)(false);
	const [exportError, setExportError] = (0, import_react.useState)(null);
	const exportUserData = useAction(authActionsApi.exportUserData);
	const handleExportData = () => {
		if (!user && !isPreviewMode) {
			setExportError("You must be signed in to export your data.");
			return;
		}
		setExportingData(true);
		setExportError(null);
		(isPreviewMode ? Promise.resolve(getPreviewSettingsExportData()) : exportUserData()).then((exportData) => {
			const filename = `cohort-data-export-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
			const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			notifyInfo({
				title: isPreviewMode ? "Preview export downloaded" : "Data exported successfully",
				message: isPreviewMode ? "Sample account data has been downloaded for this demo session." : "Your personal data has been downloaded as a JSON file."
			});
		}).catch((exportErr) => {
			const message = exportErr instanceof Error ? exportErr.message : "Failed to export data";
			setExportError(message);
			notifyFailure({
				title: "Export failed",
				message
			});
		}).finally(() => {
			setExportingData(false);
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-5" }), "Export your data"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Download a copy of all your personal data in JSON format (GDPR Article 20 - Right to Data Portability)." })] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground mb-4",
			children: "This export includes your profile information, clients, projects, tasks, proposals, messages, and activity history. The download will be in machine-readable JSON format."
		}), exportError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-destructive mb-4",
			children: exportError
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFooter, {
			className: "flex justify-end",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				onClick: handleExportData,
				disabled: exportingData,
				children: [exportingData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 size-4" }), exportingData ? "Preparing export..." : "Download my data"]
			})
		})
	] });
}
function DeleteAccountCard({ embedded = false }) {
	const { isPreviewMode } = usePreview();
	const [deleteDialogOpen, setDeleteDialogOpen] = (0, import_react.useState)(false);
	const handleOpenDeleteDialog = () => {
		setDeleteDialogOpen(true);
	};
	const body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: embedded ? "px-0 pt-0" : void 0,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2 text-destructive",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
					className: "size-5",
					"aria-hidden": true
				}), "Delete account"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Permanently remove your account and all associated data (GDPR Article 17 - Right to Erasure)." })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: embedded ? "px-0" : void 0,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-relaxed text-muted-foreground",
				children: "Deleting your account will revoke access across all connected workspaces, stop integrations, and permanently erase stored reports, messages, and personal information. This action cannot be undone. We recommend exporting your data before proceeding."
			}), isPreviewMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted-foreground",
				children: "Preview mode keeps this action local-only and does not remove any real account data."
			}) : null]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFooter, {
			className: embedded ? "flex justify-end px-0 pb-0" : "flex justify-end",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "destructive",
				onClick: handleOpenDeleteDialog,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
					className: "mr-2 size-4",
					"aria-hidden": true
				}), "Delete account"]
			})
		})
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [embedded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-0",
		children: body
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "border-destructive/40",
		children: body
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeleteAccountDialog, {
		open: deleteDialogOpen,
		onOpenChange: setDeleteDialogOpen
	})] });
}
function DeleteAccountDialog({ open, onOpenChange }) {
	const { user, deleteAccount } = useAuth();
	const { isPreviewMode } = usePreview();
	const { push } = useRouter$1();
	const [deleteDialogState, setDeleteDialogState] = (0, import_react.useState)({
		confirm: "",
		error: null,
		loading: false
	});
	const { confirm: deleteConfirm, error: deleteAccountError, loading: deleteAccountLoading } = deleteDialogState;
	(0, import_react.useEffect)(() => {
		if (open) return;
		const frame = requestAnimationFrame(() => {
			setDeleteDialogState({
				confirm: "",
				error: null,
				loading: false
			});
		});
		return () => {
			cancelAnimationFrame(frame);
		};
	}, [open]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const frame = requestAnimationFrame(() => {
			document.getElementById("delete-account-confirm")?.focus();
		});
		return () => cancelAnimationFrame(frame);
	}, [open]);
	const handleAccountDeletion = () => {
		if (isPreviewMode) {
			notifyInfo({
				title: "Preview mode",
				message: "Sample account deletion is disabled. No real data was changed."
			});
			onOpenChange(false);
			return;
		}
		if (!user) {
			setDeleteDialogState((prev) => ({
				...prev,
				error: "You must be signed in to delete your account."
			}));
			return;
		}
		if (deleteConfirm.trim().toLowerCase() !== "delete") {
			setDeleteDialogState((prev) => ({
				...prev,
				error: "Type DELETE to confirm this action."
			}));
			return;
		}
		setDeleteDialogState((prev) => ({
			...prev,
			loading: true,
			error: null
		}));
		Object.keys(localStorage).filter((key) => key.startsWith("cohorts_") || key.startsWith("tips_dismissed")).forEach((key) => localStorage.removeItem(key));
		deleteAccount().then(() => {
			notifySuccess({
				title: "Account deleted",
				message: "Your account and associated data have been removed."
			});
			onOpenChange(false);
			push("/");
		}).catch((accountError) => {
			const message = accountError instanceof Error ? accountError.message : "Failed to delete account";
			setDeleteDialogState((prev) => ({
				...prev,
				error: message
			}));
			notifyFailure({
				title: "Account deletion failed",
				message
			});
		}).finally(() => {
			setDeleteDialogState((prev) => ({
				...prev,
				loading: false
			}));
		});
	};
	const handleDeleteConfirmChange = (event) => {
		setDeleteDialogState((prev) => ({
			...prev,
			confirm: event.target.value,
			error: null
		}));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Confirm account deletion" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
				"This will permanently remove your account, integrations, and stored analytics. Type ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold",
					children: "DELETE"
				}),
				" to confirm."
			] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "delete-account-confirm",
					value: deleteConfirm,
					onChange: handleDeleteConfirmChange,
					placeholder: "Type DELETE to confirm",
					autoComplete: "off",
					autoCorrect: "off",
					spellCheck: false,
					"aria-invalid": deleteAccountError ? true : void 0,
					"aria-describedby": deleteAccountError ? "delete-account-error" : "delete-account-hint"
				}), deleteAccountError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					id: "delete-account-error",
					className: "text-sm text-destructive",
					role: "alert",
					children: deleteAccountError
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					id: "delete-account-hint",
					className: "sr-only",
					children: "Confirmation must match the word DELETE in any letter case."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					disabled: deleteAccountLoading,
					children: "Cancel"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "destructive",
				onClick: handleAccountDeletion,
				disabled: deleteConfirm.trim().toLowerCase() !== "delete" || deleteAccountLoading,
				children: [deleteAccountLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : null, "Delete account"]
			})] })
		] })
	});
}
var CATEGORY_ICONS = {
	tasks: SquareCheckBig,
	collaboration: MessageSquare,
	ads: ChartColumn,
	digest: Mail,
	projects: FolderKanban,
	meetings: Calendar
};
function NotificationCategoryRow({ category, index, preferences, globallyDisabled, onChannelChange }) {
	const Icon = CATEGORY_ICONS[category];
	const meta = CATEGORY_LABELS[category];
	const channels = preferences.categories[category];
	const handleInAppChange = (checked) => onChannelChange(category, "inApp", checked);
	const handleEmailChange = (checked) => onChannelChange(category, "email", checked);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem] items-center gap-2 p-4 sm:grid-cols-[1fr_5rem_5rem_5rem]", index < NOTIFICATION_CATEGORIES.length - 1 && "border-b border-border/60"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						className: "size-4",
						"aria-hidden": true
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 space-y-0.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldTitle, {
						className: "text-sm",
						children: meta.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldDescription, {
						className: "text-xs",
						children: meta.description
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					checked: channels.inApp,
					disabled: globallyDisabled,
					onCheckedChange: handleInAppChange,
					"aria-label": `${meta.title} in-app notifications`
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					checked: channels.email,
					disabled: globallyDisabled,
					onCheckedChange: handleEmailChange,
					"aria-label": `${meta.title} email notifications`
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center justify-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					checked: false,
					disabled: true,
					"aria-label": `${meta.title} push notifications`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "secondary",
					className: "px-1.5 py-0 text-[9px] font-semibold uppercase",
					children: "Soon"
				})]
			})
		]
	});
}
function NotificationCategoryMatrix({ preferences, disabled = false, onChannelChange }) {
	const globallyDisabled = disabled || preferences.pauseAll;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-xl border border-border/60",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[1fr_4.5rem_4.5rem_4.5rem] items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:grid-cols-[1fr_5rem_5rem_5rem]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Category" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-center",
						children: "In-app"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-center",
						children: "Email"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-center",
						children: "Push"
					})
				]
			}),
			NOTIFICATION_CATEGORIES.map((category, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationCategoryRow, {
				category,
				index,
				preferences,
				globallyDisabled,
				onChannelChange
			}, category)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 border-t border-border/60 bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, {
					className: "size-3.5 shrink-0",
					"aria-hidden": true
				}), "Browser push notifications are coming soon."]
			})
		]
	});
}
var QUIET_HOURS_LABEL_PREFIX = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, {
	className: "size-4 text-muted-foreground",
	"aria-hidden": true
});
function createInitialNotificationPreferencesPanelState() {
	return {
		localPrefs: null,
		loading: true,
		saving: false,
		error: null
	};
}
function notificationPreferencesPanelReducer(state, action) {
	switch (action.type) {
		case "setLocalPrefs": return {
			...state,
			localPrefs: action.value
		};
		case "setLoading": return {
			...state,
			loading: action.value
		};
		case "setSaving": return {
			...state,
			saving: action.value
		};
		case "setError": return {
			...state,
			error: action.value
		};
		case "syncPreview": return {
			localPrefs: action.value,
			loading: false,
			saving: false,
			error: null
		};
		case "syncServer": return {
			localPrefs: action.value,
			loading: false,
			saving: false,
			error: null
		};
		case "syncLoadFailed": return {
			...state,
			loading: false,
			error: action.error
		};
		case "beginPersist": return {
			...state,
			localPrefs: action.next,
			saving: true,
			error: null
		};
		case "persistSuccess": return {
			...state,
			localPrefs: action.value,
			saving: false
		};
		case "persistFailure": return {
			...state,
			localPrefs: action.previous,
			error: action.error,
			saving: false
		};
		default: return state;
	}
}
function NotificationPreferencesPanel() {
	const { isPreviewMode } = usePreview();
	const serverPrefs = useQuery(settingsApi.getMyNotificationPreferences);
	const prefsQueryError = useConvexQueryError({
		data: serverPrefs,
		skipped: isPreviewMode,
		fallbackMessage: "Unable to load notification preferences."
	});
	const updatePrefs = useMutation(settingsApi.updateMyNotificationPreferences);
	const previewPrefsRef = (0, import_react.useRef)(null);
	if (previewPrefsRef.current === null) previewPrefsRef.current = getPreviewSettingsNotificationPreferences();
	const [state, dispatch] = (0, import_react.useReducer)(notificationPreferencesPanelReducer, void 0, createInitialNotificationPreferencesPanelState);
	const { localPrefs, loading, saving, error } = state;
	const displayError = mergeQueryErrors(error, prefsQueryError);
	const isMountedRef = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (isPreviewMode) {
			dispatch({
				type: "syncPreview",
				value: previewPrefsRef.current
			});
			return;
		}
		if (serverPrefs === void 0) {
			dispatch({
				type: "setLoading",
				value: true
			});
			return;
		}
		if (serverPrefs === null) {
			dispatch({
				type: "syncLoadFailed",
				error: "Unable to load notification preferences"
			});
			return;
		}
		dispatch({
			type: "syncServer",
			value: normalizePreferences(serverPrefs)
		});
	}, [isPreviewMode, serverPrefs]);
	const persist = async (patch, options) => {
		if (!localPrefs) return null;
		const previous = localPrefs;
		const next = applyPreferencesPatch(localPrefs, patch);
		dispatch({
			type: "beginPersist",
			previous,
			next
		});
		try {
			if (isPreviewMode) {
				previewPrefsRef.current = next;
				if (!options?.silent) notifyInfo({
					title: "Preview mode",
					message: "Notification settings updated locally for this session."
				});
				dispatch({
					type: "setSaving",
					value: false
				});
				return next;
			}
			const normalized = normalizePreferences(await updatePrefs({
				pauseAll: patch.pauseAll,
				quietHours: patch.quietHours,
				categories: patch.categories
			}));
			if (isMountedRef.current) dispatch({
				type: "persistSuccess",
				value: normalized
			});
			if (!options?.silent) notifySuccess({ message: "Notification preferences saved" });
			return normalized;
		} catch (saveError) {
			logError(saveError, "NotificationPreferencesPanel:persist");
			const message = asErrorMessage(saveError);
			if (isMountedRef.current) dispatch({
				type: "persistFailure",
				previous,
				error: message
			});
			if (!options?.silent) notifyFailure({
				title: "Could not save preferences",
				message
			});
			return null;
		}
	};
	const handlePauseAllChange = (checked) => {
		persist({ pauseAll: checked });
	};
	const handleQuietHoursEnabledChange = (checked) => {
		if (!localPrefs) return;
		persist({ quietHours: {
			...localPrefs.quietHours,
			enabled: checked
		} });
	};
	const handleQuietHoursTimeChange = (field, value) => {
		if (!localPrefs) return;
		persist({ quietHours: {
			...localPrefs.quietHours,
			[field]: value
		} }, { silent: true });
	};
	const handleChannelChange = (category, channel, enabled) => {
		persist({ categories: { [category]: { [channel]: enabled } } });
	};
	const handleQuietHoursStartChange = (event) => {
		handleQuietHoursTimeChange("start", event.target.value);
	};
	const handleQuietHoursEndChange = (event) => {
		handleQuietHoursTimeChange("end", event.target.value);
	};
	if (loading || !localPrefs) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
		className: "py-10 text-sm text-muted-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
			"aria-live": "polite",
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
				className: "size-4 animate-spin",
				"aria-hidden": true
			}), "Loading notification preferences…"]
		})
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
					className: "flex items-center gap-2 text-lg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
						className: "size-5 text-primary",
						"aria-hidden": true
					}), "Notifications"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Choose how you receive updates in the app and by email. Changes save automatically." })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
				href: "/dashboard/notifications",
				className: "inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline",
				children: ["Open notification center", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
					className: "size-3.5",
					"aria-hidden": true
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-6",
			children: [
				saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
					className: "flex items-center gap-2 text-sm text-muted-foreground",
					"aria-live": "polite",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "size-4 animate-spin",
						"aria-hidden": true
					}), "Saving…"]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
					id: "pause-all-notifications",
					label: "Pause all notifications",
					description: "Temporarily stop in-app and email alerts. Your preferences are kept.",
					orientation: "horizontal",
					className: "items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						id: "pause-all-notifications",
						checked: localPrefs.pauseAll,
						disabled: saving,
						onCheckedChange: handlePauseAllChange
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 rounded-lg border border-border/60 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
						id: "quiet-hours-enabled",
						label: "Quiet hours",
						description: "Pause email notifications during a daily window (in-app still delivers).",
						labelPrefix: QUIET_HOURS_LABEL_PREFIX,
						orientation: "horizontal",
						className: "items-start justify-between",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							id: "quiet-hours-enabled",
							checked: localPrefs.quietHours.enabled,
							disabled: saving || localPrefs.pauseAll,
							onCheckedChange: handleQuietHoursEnabledChange
						})
					}), localPrefs.quietHours.enabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
							id: "quiet-hours-start",
							label: "From",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "quiet-hours-start",
								type: "time",
								value: localPrefs.quietHours.start,
								disabled: saving || localPrefs.pauseAll,
								onChange: handleQuietHoursStartChange
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
							id: "quiet-hours-end",
							label: "Until",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "quiet-hours-end",
								type: "time",
								value: localPrefs.quietHours.end,
								disabled: saving || localPrefs.pauseAll,
								onChange: handleQuietHoursEndChange
							})
						})]
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationCategoryMatrix, {
					preferences: localPrefs,
					disabled: saving,
					onChannelChange: handleChannelChange
				}),
				displayError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
					variant: "destructive",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Preferences unavailable" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: displayError })]
				}) : null
			]
		})] })
	});
}
function PrivacySettingsCard() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-5" }), "Privacy & Terms"]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Review our privacy policies and terms of service." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Privacy policy"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Learn how we collect, use, and protect your data."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
						href: "/privacy",
						children: "View policy"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Terms of service"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Review our terms and conditions of use."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
						href: "/terms",
						children: "View terms"
					})
				})]
			})
		]
	}) })] });
}
/**
* Compute avatar initials from a name or email.
*/
function getAvatarInitials(name, email) {
	const parts = (name?.trim() || email?.trim() || "C").split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "C";
	return `${parts[0]?.[0] ?? ""}${parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : ""}`.toUpperCase() || "C";
}
function ProfileAvatarEditor({ avatarPreview, avatarInitials, avatarUploading, avatarError, avatarInputRef, onAvatarButtonClick, onAvatarFileChange, onAvatarRemoveClick, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		ref: avatarInputRef,
		type: "file",
		accept: "image/png,image/jpeg,image/jpg,image/webp",
		"aria-label": "Upload profile photo",
		className: "hidden",
		onChange: onAvatarFileChange
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 sm:flex-row sm:items-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
			className: "size-16",
			children: avatarPreview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
				src: avatarPreview,
				alt: "Profile photo"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, { children: avatarInitials })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						onClick: onAvatarButtonClick,
						disabled: avatarUploading,
						children: [avatarUploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "mr-2 size-4" }), avatarUploading ? "Uploading…" : avatarPreview ? "Change photo" : "Upload photo"]
					}), avatarPreview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "ghost",
						onClick: onAvatarRemoveClick,
						disabled: avatarUploading,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 size-4" }), "Remove"]
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Use a square image (PNG, JPG, or WebP) under 5MB."
				}),
				avatarError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-destructive",
					children: avatarError
				}) : null
			]
		})]
	})] });
}
function ProfileContactFields({ profileName, profilePhone, phoneError, savingProfile, canSaveProfile, profileError, onProfileNameChange, onProfilePhoneChange, onProfilePhoneBlur, onSubmit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit,
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "profile-name",
						children: "Display name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "profile-name",
						value: profileName,
						onChange: onProfileNameChange,
						placeholder: "e.g. Jordan Michaels",
						autoComplete: "name"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "profile-phone",
							children: "Phone number"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "profile-phone",
							value: profilePhone,
							onChange: onProfilePhoneChange,
							onBlur: onProfilePhoneBlur,
							placeholder: "+1 555 000 1234",
							autoComplete: "tel",
							"aria-describedby": phoneError ? "phone-error" : "phone-hint",
							"aria-invalid": phoneError ? true : void 0,
							className: phoneError ? "border-destructive focus-visible:ring-destructive" : ""
						}),
						phoneError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							id: "phone-error",
							className: "text-xs text-destructive",
							children: phoneError
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							id: "phone-hint",
							className: "text-xs text-muted-foreground",
							children: "Include country code for international numbers."
						})
					]
				})]
			}),
			profileError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-destructive",
				children: profileError
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "We use this information across proposals and automated notifications."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "submit",
					disabled: !canSaveProfile,
					children: [savingProfile ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : null, "Save changes"]
				})]
			})
		]
	});
}
function ProfileCardLoading() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Profile Information" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Update the contact details that appear in proposals and client-facing emails." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
		className: "flex items-center gap-2 text-sm text-muted-foreground",
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
			className: "size-4 animate-spin",
			"aria-hidden": true
		}), "Loading profile…"]
	}) })] });
}
function useProfileAvatarUpload({ isPreviewMode, user, avatarPreview, dispatch, setPreviewUser }) {
	const { user: authUser } = useAuth();
	const convex = useConvex();
	const generateUploadUrl = useMutation(filesApi.generateUploadUrl);
	const syncMetadata = useMutation(filesApi.syncMetadata);
	const updateMyProfile = useMutation(settingsApi.updateMyProfile);
	const avatarInputRef = (0, import_react.useRef)(null);
	const tempAvatarUrlRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const avatarUrlRef = tempAvatarUrlRef;
		return () => {
			if (avatarUrlRef.current) {
				URL.revokeObjectURL(avatarUrlRef.current);
				avatarUrlRef.current = null;
			}
		};
	}, []);
	const uploadAvatarImage = async (file) => {
		const storageId = await uploadStorageFile({
			file,
			contentType: file.type || "image/jpeg",
			generateUploadUrl: () => generateUploadUrl({}),
			syncMetadata: (args) => syncMetadata(args)
		});
		const workspaceId = authUser?.agencyId;
		if (!workspaceId) throw new Error("Workspace context missing");
		const publicUrl = await convex.query(filesApi.getPublicUrl, {
			workspaceId,
			storageId
		});
		if (!publicUrl?.url) throw new Error("Unable to resolve uploaded file URL");
		return publicUrl.url;
	};
	const handleAvatarRemove = async () => {
		if (isPreviewMode) {
			if (tempAvatarUrlRef.current) {
				URL.revokeObjectURL(tempAvatarUrlRef.current);
				tempAvatarUrlRef.current = null;
			}
			dispatch({
				type: "setAvatarPreviewOverride",
				value: null
			});
			setPreviewUser((current) => ({
				...current,
				photoUrl: null
			}));
			notifyInfo({
				title: "Preview mode",
				message: "Sample profile photo removed locally for this session."
			});
			return;
		}
		if (!user) {
			dispatch({
				type: "setAvatarError",
				value: "You must be signed in to update your avatar."
			});
			return;
		}
		dispatch({
			type: "setAvatarUploading",
			value: true
		});
		dispatch({
			type: "setAvatarError",
			value: null
		});
		if (tempAvatarUrlRef.current) {
			URL.revokeObjectURL(tempAvatarUrlRef.current);
			tempAvatarUrlRef.current = null;
		}
		await updateMyProfile({ photoUrl: null }).then(() => {
			dispatch({
				type: "setAvatarPreviewOverride",
				value: null
			});
			notifySuccess({
				title: "Profile photo removed",
				message: "We removed your avatar."
			});
		}).catch((removeError) => {
			logError(removeError, "ProfileCard:removeAvatar");
			const msg = asErrorMessage(removeError);
			dispatch({
				type: "setAvatarError",
				value: msg
			});
			notifyFailure({
				title: "Remove failed",
				message: msg
			});
		}).finally(() => {
			dispatch({
				type: "setAvatarUploading",
				value: false
			});
		});
	};
	const handleAvatarButtonClick = () => {
		dispatch({
			type: "setAvatarError",
			value: null
		});
		avatarInputRef.current?.click();
	};
	const handleAvatarFileChange = async (event) => {
		const file = event.target.files?.[0];
		if (!file) return;
		if (!user && !isPreviewMode) {
			dispatch({
				type: "setAvatarError",
				value: "You must be signed in to update your avatar."
			});
			event.target.value = "";
			return;
		}
		const validation = validateFile(file, {
			allowedTypes: [
				"image/png",
				"image/jpeg",
				"image/jpg",
				"image/webp"
			],
			maxSizeMb: 5
		});
		if (!validation.valid) {
			dispatch({
				type: "setAvatarError",
				value: validation.error || "Invalid image file."
			});
			event.target.value = "";
			return;
		}
		const previousUrl = avatarPreview;
		if (isPreviewMode) {
			if (tempAvatarUrlRef.current) {
				URL.revokeObjectURL(tempAvatarUrlRef.current);
				tempAvatarUrlRef.current = null;
			}
			const objectUrl = URL.createObjectURL(file);
			tempAvatarUrlRef.current = objectUrl;
			dispatch({
				type: "setAvatarPreviewOverride",
				value: objectUrl
			});
			setPreviewUser((current) => ({
				...current,
				photoUrl: objectUrl
			}));
			notifyInfo({
				title: "Preview mode",
				message: "Sample profile photo updated locally for this session."
			});
			event.target.value = "";
			return;
		}
		dispatch({
			type: "setAvatarUploading",
			value: true
		});
		dispatch({
			type: "setAvatarError",
			value: null
		});
		if (tempAvatarUrlRef.current) {
			URL.revokeObjectURL(tempAvatarUrlRef.current);
			tempAvatarUrlRef.current = null;
		}
		const objectUrl = URL.createObjectURL(file);
		tempAvatarUrlRef.current = objectUrl;
		dispatch({
			type: "setAvatarPreviewOverride",
			value: objectUrl
		});
		await uploadAvatarImage(file).then(async (photoUrl) => {
			await updateMyProfile({ photoUrl });
			dispatch({
				type: "setAvatarPreviewOverride",
				value: photoUrl
			});
			notifySuccess({
				title: "Photo uploaded",
				message: "Your profile photo has been updated."
			});
		}).catch((uploadError) => {
			logError(uploadError, "ProfileCard:uploadAvatar");
			const msg = asErrorMessage(uploadError);
			dispatch({
				type: "setAvatarError",
				value: msg
			});
			dispatch({
				type: "setAvatarPreviewOverride",
				value: previousUrl ?? null
			});
			notifyFailure({
				title: "Upload failed",
				message: msg
			});
		}).finally(() => {
			dispatch({
				type: "setAvatarUploading",
				value: false
			});
			if (tempAvatarUrlRef.current) {
				URL.revokeObjectURL(tempAvatarUrlRef.current);
				tempAvatarUrlRef.current = null;
			}
			event.target.value = "";
		});
	};
	const handleAvatarRemoveClick = () => {
		handleAvatarRemove();
	};
	return {
		avatarInputRef,
		handleAvatarButtonClick,
		handleAvatarFileChange,
		handleAvatarRemoveClick
	};
}
function isPhoneValid(phone) {
	const trimmed = phone.trim();
	if (!trimmed) return true;
	return /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,14}$/.test(trimmed);
}
function createInitialProfileEditState() {
	return {
		profileNameDraft: null,
		profilePhoneDraft: null,
		profileError: null,
		phoneError: null,
		savingProfile: false,
		avatarPreviewOverride: void 0,
		avatarError: null,
		avatarUploading: false
	};
}
function profileEditReducer(state, action) {
	switch (action.type) {
		case "setProfileNameDraft": return {
			...state,
			profileNameDraft: action.value,
			profileError: null
		};
		case "setProfilePhoneDraft": return {
			...state,
			profilePhoneDraft: action.value,
			phoneError: null,
			profileError: null
		};
		case "setProfileError": return {
			...state,
			profileError: action.value
		};
		case "setPhoneError": return {
			...state,
			phoneError: action.value
		};
		case "setSavingProfile": return {
			...state,
			savingProfile: action.value
		};
		case "setAvatarPreviewOverride": return {
			...state,
			avatarPreviewOverride: action.value
		};
		case "setAvatarError": return {
			...state,
			avatarError: action.value
		};
		case "setAvatarUploading": return {
			...state,
			avatarUploading: action.value
		};
		case "clearProfileErrors": return {
			...state,
			profileError: null
		};
		case "clearPhoneErrors": return {
			...state,
			phoneError: null
		};
		case "commitProfileDraft": return {
			...state,
			profileNameDraft: action.name,
			profilePhoneDraft: action.phone
		};
		default: return state;
	}
}
function ProfileCard() {
	const { isPreviewMode } = usePreview();
	const profile = useQuery(settingsApi.getMyProfile);
	const updateMyProfile = useMutation(settingsApi.updateMyProfile);
	const [previewUser, setPreviewUser] = (0, import_react.useState)(() => getPreviewSettingsProfile());
	const [editState, dispatch] = (0, import_react.useReducer)(profileEditReducer, void 0, createInitialProfileEditState);
	const user = isPreviewMode ? previewUser : profile;
	const { profileNameDraft, profilePhoneDraft, profileError, phoneError, savingProfile, avatarPreviewOverride, avatarError, avatarUploading } = editState;
	const profileName = profileNameDraft ?? user?.name ?? "";
	const profilePhone = profilePhoneDraft ?? user?.phoneNumber ?? "";
	const avatarPreview = avatarPreviewOverride === void 0 ? user?.photoUrl ?? null : avatarPreviewOverride;
	const avatar = useProfileAvatarUpload({
		isPreviewMode,
		user,
		avatarPreview,
		dispatch,
		setPreviewUser
	});
	const hasProfileChanges = (() => {
		const originalName = user?.name ?? "";
		const originalPhone = user?.phoneNumber ?? "";
		return profileName.trim() !== originalName || profilePhone.trim() !== originalPhone;
	})();
	const avatarInitials = getAvatarInitials(profileName.trim() || user?.name, user?.email);
	const isProfileNameValid = profileName.trim().length >= 2;
	const canSaveProfile = (isPreviewMode || Boolean(user)) && hasProfileChanges && isProfileNameValid && !phoneError && !savingProfile;
	const handleProfileSubmit = async (event) => {
		event.preventDefault();
		if (!user && !isPreviewMode) {
			dispatch({
				type: "setProfileError",
				value: "You must be signed in to update your profile."
			});
			return;
		}
		const nextName = profileName.trim();
		const nextPhone = profilePhone.trim();
		if (nextName.length < 2) {
			dispatch({
				type: "setProfileError",
				value: "Enter a name with at least two characters."
			});
			return;
		}
		if (!isPhoneValid(nextPhone)) {
			dispatch({
				type: "setPhoneError",
				value: "Enter a valid phone number (e.g. +1 555 000 1234)."
			});
			return;
		}
		dispatch({
			type: "setSavingProfile",
			value: true
		});
		dispatch({ type: "clearProfileErrors" });
		if (isPreviewMode) {
			setPreviewUser((current) => ({
				...current,
				name: nextName,
				phoneNumber: nextPhone.length ? nextPhone : null
			}));
			dispatch({
				type: "commitProfileDraft",
				name: nextName,
				phone: nextPhone
			});
			dispatch({
				type: "setSavingProfile",
				value: false
			});
			notifyInfo({
				title: "Preview mode",
				message: "Profile changes were applied locally for this session."
			});
			return;
		}
		await updateMyProfile({
			name: nextName,
			phoneNumber: nextPhone.length ? nextPhone : null
		}).then(() => {
			dispatch({
				type: "commitProfileDraft",
				name: nextName,
				phone: nextPhone
			});
			notifySuccess({
				title: "Profile updated",
				message: "Your changes were saved."
			});
		}).catch((submitError) => {
			const message = submitError instanceof Error ? submitError.message : "Failed to update profile";
			dispatch({
				type: "setProfileError",
				value: message
			});
			notifyFailure({
				title: "Profile update failed",
				message
			});
		}).finally(() => {
			dispatch({
				type: "setSavingProfile",
				value: false
			});
		});
	};
	const handleProfileNameChange = (event) => {
		dispatch({
			type: "setProfileNameDraft",
			value: event.target.value
		});
	};
	const handleProfilePhoneChange = (event) => {
		dispatch({
			type: "setProfilePhoneDraft",
			value: event.target.value
		});
	};
	const handleProfilePhoneBlur = () => {
		if (profilePhone.trim() && !isPhoneValid(profilePhone)) dispatch({
			type: "setPhoneError",
			value: "Enter a valid phone number (e.g. +1 555 000 1234)."
		});
		else dispatch({ type: "clearPhoneErrors" });
	};
	if (!isPreviewMode && profile === void 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileCardLoading, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Profile Information" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Update the contact details that appear in proposals and client-facing emails." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileAvatarEditor, {
			avatarPreview,
			avatarInitials,
			avatarUploading,
			avatarError,
			avatarInputRef: avatar.avatarInputRef,
			onAvatarButtonClick: avatar.handleAvatarButtonClick,
			onAvatarFileChange: avatar.handleAvatarFileChange,
			onAvatarRemoveClick: avatar.handleAvatarRemoveClick,
			disabled: savingProfile
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileContactFields, {
			profileName,
			profilePhone,
			phoneError,
			savingProfile,
			canSaveProfile,
			profileError,
			onProfileNameChange: handleProfileNameChange,
			onProfilePhoneChange: handleProfilePhoneChange,
			onProfilePhoneBlur: handleProfilePhoneBlur,
			onSubmit: handleProfileSubmit
		})]
	})] });
}
function CurrencySelect({ value, onValueChange, disabled = false, placeholder = "Currency", className, showPopular = true, compact = false, id }) {
	const normalizedValue = value?.toUpperCase() || "USD";
	const currencyInfo = SUPPORTED_CURRENCIES[normalizedValue] ?? SUPPORTED_CURRENCIES.USD;
	const allOptions = getCurrencyOptions();
	const handleValueChange = (nextValue) => {
		onValueChange(nextValue);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
		value: normalizedValue,
		onValueChange: handleValueChange,
		disabled,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
			id,
			className: cn(compact ? "w-[100px]" : "w-[140px]", className),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {
				placeholder,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: currencyInfo.symbol
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: normalizedValue
					})]
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
			className: "max-h-[300px]",
			children: [showPopular && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-2 py-1.5 text-xs font-medium text-muted-foreground",
					children: "Popular"
				}),
				POPULAR_CURRENCIES.map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: code,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-6 font-medium",
								children: SUPPORTED_CURRENCIES[code].symbol
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-10",
								children: code
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: SUPPORTED_CURRENCIES[code].name
							})
						]
					})
				}, code)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-1 border-t border-muted" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-2 py-1.5 text-xs font-medium text-muted-foreground",
					children: "All currencies"
				})
			] }), allOptions.flatMap((opt) => !showPopular || !POPULAR_CURRENCIES.includes(opt.value) ? [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
				value: opt.value,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-6 font-medium",
							children: opt.symbol
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-10",
							children: opt.value
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: SUPPORTED_CURRENCIES[opt.value].name
						})
					]
				})
			}, opt.value)] : [])]
		})]
	});
}
function RegionalPreferencesCard() {
	const { preferences, loading: preferencesLoading, error: preferencesError, clearError, updateCurrency } = usePreferences();
	const { isPreviewMode } = usePreview();
	const [savingCurrency, setSavingCurrency] = (0, import_react.useState)(false);
	const [previewCurrency, setPreviewCurrency] = (0, import_react.useState)(() => getPreviewSettingsRegionalPreferences().currency);
	const handleCurrencyChange = (value) => {
		if (isPreviewMode) {
			setPreviewCurrency(value);
			notifyInfo({
				title: "Preview mode",
				message: `Default currency changed to ${value} for this session only.`
			});
			return;
		}
		setSavingCurrency(true);
		updateCurrency(value).then(() => {
			notifySuccess({
				title: "Currency updated",
				message: `Your default currency has been changed to ${value}.`
			});
		}).catch((err) => {
			reportConvexFailure({
				error: err,
				context: "regional-preferences-card.tsx:catch",
				title: "Could not update currency",
				fallbackMessage: "Could not update currency"
			});
		}).finally(() => {
			setSavingCurrency(false);
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "size-5" }), "Regional preferences"]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Set your preferred currency for displaying financial data across the dashboard." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "space-y-4",
		children: [
			preferencesError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "alert",
				className: "flex flex-col gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: preferencesError }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						className: "shrink-0 text-destructive",
						onClick: clearError,
						children: "Dismiss"
					})]
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "currency-select",
						children: "Default currency"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Amounts in analytics and reports will display in this currency."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CurrencySelect, {
					id: "currency-select",
					value: isPreviewMode ? previewCurrency : preferences.currency,
					onValueChange: handleCurrencyChange,
					disabled: !isPreviewMode && preferencesLoading || savingCurrency,
					className: "w-40"
				})]
			}),
			savingCurrency && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), "Saving preference…"]
			})
		]
	})] });
}
function SettingsPageHeader({ isPreviewMode, className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: cn("flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-start sm:justify-between", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-start gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-11 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-primary shadow-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, {
					className: "size-5",
					"aria-hidden": true
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						id: "settings-heading",
						className: "text-2xl font-semibold tracking-tight text-foreground sm:text-3xl",
						children: "Settings"
					}), isPreviewMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: "text-[10px] font-semibold uppercase tracking-wider",
						children: "Preview"
					}) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]",
					children: "Manage your profile, notifications, and account preferences for this workspace."
				})]
			})]
		}), children ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex shrink-0 flex-wrap items-center gap-2",
			children
		}) : null]
	});
}
function parseSettingsTab(value) {
	if (value === "account") return "account";
	if (value === "notifications") return "notifications";
	return "profile";
}
function SettingsPageFallback() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("output", {
		className: "flex min-h-[40vh] items-center justify-center",
		"aria-live": "polite",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-sm text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
				className: "size-4 animate-spin",
				"aria-hidden": true
			}), "Loading settings…"]
		})
	});
}
function SettingsPageInner() {
	const { isPreviewMode } = usePreview();
	const { replace } = useRouter$1();
	const searchParams = useSearchParams();
	const activeTab = parseSettingsTab(searchParams.get.bind(searchParams)("tab"));
	const handleSettingsTabChange = (value) => {
		const next = parseSettingsTab(value);
		(0, import_react.startTransition)(() => {
			replace(`${window.location.pathname}?tab=${next}`, { scroll: false });
		});
	};
	const previewDescription = isPreviewMode ? " Changes apply locally in preview mode only." : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		id: "settings-page",
		className: "mx-auto w-full max-w-3xl space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPageHeader, { isPreviewMode }),
			isPreviewMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-3 text-sm text-muted-foreground",
				children: "Preview mode uses sample account data. Exports and destructive actions stay local to this session."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				value: activeTab,
				onValueChange: handleSettingsTabChange,
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						"aria-label": "Settings sections",
						className: "grid h-auto w-full grid-cols-3 gap-1 rounded-xl border border-border/60 bg-muted/30 p-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "profile",
								className: cn("gap-2 rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, {
									className: "size-4",
									"aria-hidden": true
								}), "Profile"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "notifications",
								className: cn("gap-2 rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
									className: "size-4",
									"aria-hidden": true
								}), "Notifications"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "account",
								className: cn("gap-2 rounded-lg py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
									className: "size-4",
									"aria-hidden": true
								}), "Account"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "profile",
						className: "mt-0 space-y-6 focus-visible:outline-none",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileCard, {}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppearanceSettingsCard, {}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RegionalPreferencesCard, {}) })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "notifications",
						className: "mt-0 space-y-6 focus-visible:outline-none",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationPreferencesPanel, {}) })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "account",
						className: "mt-0 space-y-6 focus-visible:outline-none",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataExportCard, {}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrivacySettingsCard, {}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "border-destructive/30 bg-destructive/5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
									className: "pb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										className: "text-base text-destructive",
										children: "Danger zone"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: ["Irreversible account actions.", previewDescription] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
									className: "border-t border-destructive/20 pt-6",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeleteAccountCard, { embedded: true })
								})]
							}) })
						]
					})
				]
			})
		]
	});
}
var SETTINGS_PAGE_FALLBACK = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPageFallback, {});
function SettingsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMotionShell, {
		reveal: false,
		className: "space-y-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: SETTINGS_PAGE_FALLBACK,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPageInner, {})
		})
	});
}
function SettingsRoute() {
	const { allowPreviewAccess } = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProtectedRoute, {
		allowPreviewAccess,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceProviders, {
			enablePreview: true,
			enablePreferences: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex min-h-screen bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-h-0 w-full flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-h-0 flex-1 flex-col bg-muted/20",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
							className: "min-h-0 flex-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
								className: "min-h-full space-y-6 p-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavigationBreadcrumbs, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPage, {})]
							})
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentModeDynamic, {})]
			}) })
		})
	});
}
//#endregion
export { SettingsRoute as component };
