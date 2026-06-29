import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { tt as isScreenRecordingModeEnabled } from "./preview-data-CXkRNfsX.mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CDBnK3ba.mjs";
import { t as Skeleton } from "./skeleton-CQ4LJS0E.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { n as useClientContext } from "./client-context-BNynWehF.mjs";
import { Ar as Building2, In as Eye, Un as Database, Yt as LoaderCircle, it as RefreshCcw } from "../_libs/lucide-react.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { t as ClientWorkspaceSelector } from "./client-workspace-selector-DqJuFpOn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/preview-data-banner-rcsSBOc7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ClientAccessGate({ children }) {
	const { user } = useAuth();
	const { loading, error, clients, selectedClientId, refreshClients, retryClients } = useClientContext();
	const { isPreviewMode } = usePreview();
	const [refreshing, setRefreshing] = (0, import_react.useState)(false);
	const canManageClients = user?.role === "admin";
	const handleRetry = () => {
		if (refreshing) return;
		setRefreshing(true);
		retryClients();
		Promise.resolve(refreshClients()).finally(() => {
			setRefreshing(false);
		});
	};
	if (isPreviewMode) return children;
	if (loading && clients.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
		className: "mx-auto block w-full max-w-3xl space-y-4 py-10",
		"aria-live": "polite",
		"aria-busy": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg border border-muted/60 bg-background p-6 shadow-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-12 rounded-md" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-48 max-w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-72 max-w-full" })]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-lg" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-lg" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Loading client workspaces…"
			})
		]
	});
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "mx-auto max-w-lg border-destructive/40 bg-destructive/5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-lg",
			children: "Unable to load clients"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: error })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex flex-col gap-3 sm:flex-row sm:items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: handleRetry,
				disabled: refreshing,
				className: "gap-2",
				children: [refreshing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
					className: "size-4 shrink-0 animate-spin",
					"aria-hidden": true
				}) : null, "Try again"]
			}), canManageClients ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "outline",
				className: "gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
					href: "/admin/clients",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCcw, { className: "size-4" }), "Manage clients"]
				})
			}) : null]
		})]
	});
	if (clients.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "mx-auto max-w-2xl overflow-hidden border-muted/60 bg-background shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-2 flex size-12 items-center justify-center rounded-md bg-accent/10 text-primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, {
					className: "size-6",
					"aria-hidden": true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-lg",
				children: canManageClients ? "Create your first client workspace" : "No client workspace assigned"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: canManageClients ? "Add a client before exploring the dashboard." : "Ask an admin to invite you to a client workspace before using the dashboard." })
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "flex flex-col gap-3 sm:flex-row sm:items-center",
			children: [canManageClients ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
					href: "/admin/clients",
					children: "Add client"
				})
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: canManageClients ? "Client workspaces control analytics, tasks, projects, and collaboration access." : "This keeps client data scoped to assigned users."
			})]
		})]
	});
	if (!selectedClientId) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "mx-auto max-w-xl border-accent/30 bg-accent/5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			className: "text-lg",
			children: "Select a client workspace"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Choose a client to unlock analytics, tasks, collaboration, and project tools." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientWorkspaceSelector, { className: "w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: canManageClients ? "Need to add a new client? Head to the admin clients page." : "If no client appears here, ask an admin to add you to one."
			})]
		})]
	});
	return children;
}
function PreviewDataBanner({ className }) {
	const { isPreviewMode, togglePreviewMode } = usePreview();
	if (isScreenRecordingModeEnabled()) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": isPreviewMode ? "Preview mode" : "Sample data banner",
		className: cn("relative overflow-hidden rounded-lg border motion-chromatic-lg", isPreviewMode ? "border-warning/30 bg-warning/8" : "border-warning/20 bg-warning/6", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 opacity-30",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgb(from_var(--foreground)_r_g_b_/_0.1)_50%,transparent_75%)] bg-[length:250%_100%] animate-shimmer" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex items-center justify-between gap-4 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("flex size-9 items-center justify-center rounded-full transition-colors", isPreviewMode ? "bg-warning/15 text-warning" : "bg-warning/10 text-warning"),
						children: isPreviewMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, {
							className: "size-4",
							"aria-hidden": true
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, {
							className: "size-4",
							"aria-hidden": true
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-foreground",
						children: isPreviewMode ? "Preview Mode Active" : "Sample Data Available"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: isPreviewMode ? "Viewing demo data to preview how the dashboard looks when fully populated" : "Click to see how this dashboard looks with sample data"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: isPreviewMode ? "outline" : "default",
						onClick: togglePreviewMode,
						className: cn("gap-2 motion-chromatic", isPreviewMode ? "border-warning/30 text-warning hover:bg-warning/10 hover:text-warning" : "border-warning/30 bg-warning text-warning-foreground hover:bg-warning/90"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, {
							className: "size-3.5",
							"aria-hidden": true
						}), isPreviewMode ? "Exit Preview" : "Preview with Data"]
					})
				})]
			}),
			isPreviewMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1 w-full animate-pulse bg-warning/70" })
		]
	});
}
//#endregion
export { PreviewDataBanner as n, ClientAccessGate as t };
