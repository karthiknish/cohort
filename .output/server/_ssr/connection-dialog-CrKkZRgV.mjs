import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { n as PROVIDER_INFO } from "./themes-DBvmOGm7.mjs";
import { s as logError } from "./convex-errors-sHK0JmZ7.mjs";
import { Rn as ExternalLink, Vr as ArrowRight, Yt as LoaderCircle, cr as CircleAlert, gr as Check, or as CircleCheck, pr as ChevronRight } from "../_libs/lucide-react.mjs";
import { a as DialogFooter, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-C8tBdgAy.mjs";
import { t as Checkbox } from "./checkbox-DP7YqpAp.mjs";
import { n as AlertDescription, r as AlertTitle, t as Alert } from "./alert-DYeH1Q3p.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-Be-Tzxcj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/connection-dialog-CrKkZRgV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ERROR_MESSAGES = {
	SIGN_IN_REQUIRED: "Your session has expired. Please sign in again to continue.",
	SYNC_FAILED: "Unable to run sync job. The platform may be temporarily unavailable.",
	CONNECTION_FAILED: "Unable to connect. Please check your internet connection and try again.",
	LOAD_METRICS_FAILED: "Failed to load marketing data. Refresh the page to try again.",
	LOAD_MORE_FAILED: "Failed to load additional rows. Scroll up and try again.",
	GOOGLE_INIT_FAILED: "Failed to initialize Google Ads. Make sure you have an active Google Ads account.",
	LINKEDIN_INIT_FAILED: "Failed to initialize LinkedIn Ads. Ensure you have LinkedIn Campaign Manager access.",
	META_INIT_FAILED: "Failed to finish Meta Ads setup. Make sure you have access to a Meta Business account.",
	TIKTOK_INIT_FAILED: "Failed to finish TikTok Ads setup. Ensure you have TikTok Ads Manager access.",
	QUEUE_SYNC_FAILED: "Failed to queue sync job. Please try again in a few moments.",
	PROCESS_SYNC_FAILED: "Sync processor encountered an issue. Your data will sync on the next scheduled run.",
	DISCONNECT_FAILED: "Unable to disconnect. Please refresh the page and try again.",
	SAVE_SETTINGS_FAILED: "Unable to update automation settings. Please check your connection and try again."
};
var ERROR_GUIDANCE = {
	POPUP_BLOCKED: {
		title: "Popup blocked",
		message: "Your browser blocked the login popup.",
		action: "Allow popups for this site and try again."
	},
	OAUTH_CANCELLED: {
		title: "Login cancelled",
		message: "You closed the login window before completing.",
		action: "Click connect again to retry."
	},
	OAUTH_DENIED: {
		title: "Permission denied",
		message: "You declined the required permissions.",
		action: "To sync your ad data, we need read access to your ad accounts."
	},
	OAUTH_EXPIRED: {
		title: "Session expired",
		message: "The login process took too long.",
		action: "Click connect to start a fresh login."
	},
	NO_AD_ACCOUNTS: {
		title: "No ad accounts found",
		message: "We couldn't find ad accounts linked to your profile.",
		action: "Make sure you have admin or advertiser access to at least one ad account."
	},
	ACCOUNT_SUSPENDED: {
		title: "Account issue detected",
		message: "Your ad account may be suspended or have restrictions.",
		action: "Check your ad platform for account alerts."
	},
	RATE_LIMITED: {
		title: "Too many attempts",
		message: "We've made too many requests to the ad platform.",
		action: "Wait a few minutes before trying again."
	},
	NETWORK_ERROR: {
		title: "Connection issue",
		message: "Unable to reach the server.",
		action: "Check your internet connection and try again."
	},
	TIMEOUT: {
		title: "Request timed out",
		message: "The request took too long to complete.",
		action: "Try again. If the problem persists, the platform may be experiencing issues."
	},
	NOT_CONFIGURED: {
		title: "Integration not available",
		message: "This integration hasn't been configured yet.",
		action: "Contact support to enable this integration."
	}
};
var SUCCESS_MESSAGES = {
	SYNC_COMPLETE: (providerName) => `${providerName} metrics refreshed.`,
	SYNC_COMPLETE_WITH_RETRIES: (providerName, retries) => `${providerName} metrics refreshed after ${retries} retry(s).`,
	DISCONNECTED: (providerName) => `${providerName} has been disconnected.`,
	AUTOMATION_UPDATED: (providerName) => `${providerName} sync settings saved.`,
	META_CONNECTED: "Meta Ads connected!",
	TIKTOK_CONNECTED: "TikTok Ads connected!",
	GOOGLE_CONNECTED: "Google Ads connected!",
	LINKEDIN_CONNECTED: "LinkedIn Ads connected!"
};
var TOAST_TITLES = {
	SYNC_FAILED: "Sync failed",
	CONNECTION_FAILED: "Connection failed",
	SYNC_COMPLETE: "Sync complete",
	DISCONNECTED: "Disconnected",
	DISCONNECT_FAILED: "Disconnect failed",
	SAVE_FAILED: "Save failed",
	AUTOMATION_UPDATED: "Automation updated",
	SESSION_EXPIRED: "Session expired",
	UNABLE_TO_SYNC: "Unable to sync",
	NOTHING_TO_SYNC: "Nothing to sync right now",
	NO_SETTINGS: "No settings to save",
	META_SETUP_FAILED: "Meta setup failed",
	TIKTOK_SETUP_FAILED: "TikTok setup failed",
	CONNECTING: "Connecting…"
};
var STEP_CONFIG = {
	idle: {
		label: "Ready to connect",
		order: 0
	},
	redirecting: {
		label: "Redirecting to provider",
		order: 1
	},
	authenticating: {
		label: "Authenticating account",
		order: 2
	},
	fetching: {
		label: "Fetching ad accounts",
		order: 3
	},
	selecting: {
		label: "Selecting account",
		order: 4
	},
	syncing: {
		label: "Syncing historical data",
		order: 5
	},
	complete: {
		label: "Connection complete",
		order: 6
	},
	error: {
		label: "Connection failed",
		order: -1
	}
};
function ConnectionDialogHeader({ Icon, providerInfo }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3",
		children: [Icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex size-10 items-center justify-center rounded-full bg-info/10 text-info",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Connect ", providerInfo.name] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
			className: "text-sm",
			children: [providerInfo.estimatedSetupTime, " setup"]
		})] })]
	}) });
}
function ConnectionProgress({ step, providerName }) {
	const steps = [
		"redirecting",
		"authenticating",
		"fetching",
		"selecting",
		"syncing"
	];
	const currentOrder = STEP_CONFIG[step].order;
	if (step === "idle" || step === "error") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [step === "complete" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-10 items-center justify-center rounded-full bg-success/10 text-success",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5" })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-10 items-center justify-center rounded-full bg-info/10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin text-info" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium",
				children: step === "complete" ? `${providerName} connected!` : `Connecting to ${providerName}`
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: STEP_CONFIG[step].label
			})] })]
		}), step !== "complete" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-1",
			children: steps.map((current, index) => {
				const isComplete = currentOrder > STEP_CONFIG[current].order;
				const isCurrent = step === current;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("h-2 w-8 rounded-full transition-colors", isComplete && "bg-info", isCurrent && "bg-info/50", !isComplete && !isCurrent && "bg-muted") }), index < steps.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-[2px] w-1 bg-muted" }) : null]
				}, current);
			})
		}) : null]
	});
}
function ConnectionDialogBody({ connectionStep, error, errorGuidance, isInProgress, providerInfo, showPreConnect, providerId }) {
	const isMetaAds = providerId === "facebook" || providerId === "meta";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 py-4",
		children: [
			showPreConnect ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "mb-2 text-sm font-medium",
					children: "What you'll get"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1.5",
					children: providerInfo.benefits.map((benefit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start gap-2 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 size-4 flex-shrink-0 text-success" }), benefit]
					}, benefit))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "mb-2 text-sm font-medium",
					children: "Requirements"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1.5",
					children: providerInfo.requirements.map((requirement) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start gap-2 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "mt-0.5 size-4 flex-shrink-0 text-muted-foreground/60" }), requirement]
					}, requirement))
				})] }),
				isMetaAds ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
					className: "border-warning/20 bg-warning/5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 text-warning" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, {
						className: "text-sm text-foreground",
						children: [
							"This connects ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "paid Meta ads" }),
							" only. Organic Facebook/Instagram pages use",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Socials" }),
							" in the sidebar - a separate connection."
						]
					})]
				}) : null,
				providerInfo.loginMethod === "redirect" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
					className: "border-info/20 bg-info/5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4 text-info" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, {
						className: "text-sm text-foreground",
						children: [
							"You'll be redirected to ",
							providerInfo.shortName,
							" to log in. After granting access, you'll return here to finish account setup."
						]
					})]
				}) : null,
				providerInfo.loginMethod === "popup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
					className: "border-info/20 bg-info/5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 text-info" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, {
						className: "text-sm text-foreground",
						children: [
							"A popup window will open for you to log in to ",
							providerInfo.shortName,
							". Make sure popups are allowed for this site."
						]
					})]
				}) : null
			] }) : null,
			connectionStep === "redirecting" && providerInfo.loginMethod === "redirect" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex size-10 items-center justify-center rounded-full bg-info/10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-5 text-info" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-medium",
						children: ["Redirecting to ", providerInfo.shortName]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"You'll be taken to ",
							providerInfo.shortName,
							" to log in"
						]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
					className: "border-info/20 bg-info/5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4 text-info" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, {
						className: "text-sm text-foreground",
						children: "After logging in, you'll be automatically redirected back here to complete setup."
					})]
				})]
			}) : null,
			isInProgress && !(connectionStep === "redirecting" && providerInfo.loginMethod === "redirect") || connectionStep === "complete" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionProgress, {
				step: connectionStep,
				providerName: providerInfo.name
			}) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
				variant: "destructive",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: errorGuidance?.title ?? "Connection failed" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: error }), errorGuidance?.action ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs font-medium opacity-90",
							children: errorGuidance.action
						}) : null]
					})
				]
			}) : null,
			connectionStep === "complete" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
				className: "border-success/20 bg-success/5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-success" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, {
					className: "text-sm text-success-foreground",
					children: [
						"Your ",
						providerInfo.name,
						" account is now connected. We're syncing your last 90 days of data in the background."
					]
				})]
			}) : null
		]
	});
}
function ConnectionDialogFooterActions({ connectionStep, handleClose, handleConnect, isConnecting, isInProgress, onRetry, providerInfo, showPreConnect, error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
		className: "gap-2 sm:gap-0",
		children: [
			showPreConnect ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: handleClose,
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: handleConnect,
				disabled: isConnecting,
				children: providerInfo.loginMethod === "redirect" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					"Continue to ",
					providerInfo.shortName,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-2 size-4" })
				] }) : `Connect ${providerInfo.shortName}`
			})] }) : null,
			isInProgress ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				disabled: true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Connecting…"]
			}) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: handleClose,
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: onRetry,
				children: "Try again"
			})] }) : null,
			connectionStep === "complete" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: handleClose,
				children: "Finish setup"
			}) : null
		]
	});
}
/**
* Map raw error messages to user-friendly guidance
*/
function getErrorGuidance(error) {
	const errorLower = error.toLowerCase();
	if (errorLower.includes("popup") || errorLower.includes("blocked")) return ERROR_GUIDANCE.POPUP_BLOCKED;
	if (errorLower.includes("cancel") || errorLower.includes("closed")) return ERROR_GUIDANCE.OAUTH_CANCELLED;
	if (errorLower.includes("denied") || errorLower.includes("declined")) return ERROR_GUIDANCE.OAUTH_DENIED;
	if (errorLower.includes("timeout") || errorLower.includes("timed out")) return ERROR_GUIDANCE.TIMEOUT;
	if (errorLower.includes("network") || errorLower.includes("internet") || errorLower.includes("failed to fetch")) return ERROR_GUIDANCE.NETWORK_ERROR;
	if (errorLower.includes("not configured") || errorLower.includes("environment")) return ERROR_GUIDANCE.NOT_CONFIGURED;
	if (errorLower.includes("rate limit") || errorLower.includes("too many")) return ERROR_GUIDANCE.RATE_LIMITED;
	if (errorLower.includes("no ad accounts") || errorLower.includes("no accounts")) return ERROR_GUIDANCE.NO_AD_ACCOUNTS;
	return null;
}
var ConnectionDialog = function ConnectionDialog({ open, onOpenChange, providerId, providerIcon: Icon, onConnect, isConnecting, connectionStep, error, onRetry }) {
	const providerInfo = providerId ? PROVIDER_INFO[providerId] : null;
	const handleConnect = async () => {
		try {
			await onConnect();
		} catch (error) {
			logError(error, "ConnectionDialog:handleConnect");
		}
	};
	const handleClose = () => {
		if (!isConnecting || connectionStep === "error" || connectionStep === "complete") onOpenChange(false);
	};
	if (!providerInfo || !providerId) return null;
	const isInProgress = isConnecting && connectionStep !== "idle" && connectionStep !== "error" && connectionStep !== "complete";
	const showPreConnect = connectionStep === "idle" && !isConnecting && !error;
	const errorGuidance = error ? getErrorGuidance(error) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: handleClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionDialogHeader, {
					Icon,
					providerInfo
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionDialogBody, {
					connectionStep,
					error,
					errorGuidance,
					isInProgress,
					providerInfo,
					showPreConnect,
					providerId
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionDialogFooterActions, {
					connectionStep,
					error,
					handleClose,
					handleConnect,
					isConnecting,
					isInProgress,
					onRetry,
					providerInfo,
					showPreConnect
				})
			]
		})
	});
};
var DisconnectDialog = function DisconnectDialog({ open, onOpenChange, providerName, onConfirm, isDisconnecting }) {
	const [clearHistoricalData, setClearHistoricalData] = (0, import_react.useState)(false);
	const handleOpenChange = (nextOpen) => {
		if (nextOpen) setClearHistoricalData(false);
		onOpenChange(nextOpen);
	};
	const handleConfirm = async () => {
		await onConfirm({ clearHistoricalData });
		onOpenChange(false);
	};
	const handleClearHistoricalDataChange = (checked) => {
		setClearHistoricalData(Boolean(checked));
	};
	const checkboxId = `${providerName.replace(/\s+/g, "-").toLowerCase()}-clear-historical-data`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
		open,
		onOpenChange: handleOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
				"Disconnect ",
				providerName,
				"?"
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This will:" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "ml-4 list-disc space-y-1 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Stop all future data syncs from ", providerName] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								"Remove the connection to your ",
								providerName,
								" account"
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Keep your existing synced data in Cohorts by default" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pt-2",
						children: "You can reconnect later to resume syncing."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-md border border-muted/60 p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					htmlFor: checkboxId,
					className: "flex items-start gap-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
						id: checkboxId,
						checked: clearHistoricalData,
						onCheckedChange: handleClearHistoricalDataChange,
						disabled: isDisconnecting,
						"aria-label": "Clear historical data"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Also remove historical ",
						providerName,
						" metrics from this workspace."
					] })]
				})
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
			disabled: isDisconnecting,
			children: "Cancel"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
			onClick: handleConfirm,
			disabled: isDisconnecting,
			className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			children: isDisconnecting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Disconnecting…"] }) : "Disconnect"
		})] })] })
	});
};
//#endregion
export { TOAST_TITLES as a, SUCCESS_MESSAGES as i, DisconnectDialog as n, ERROR_MESSAGES as r, ConnectionDialog as t };
