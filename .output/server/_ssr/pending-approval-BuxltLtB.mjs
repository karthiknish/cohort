import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { r as useRouter$1 } from "./navigation-C1M-rNAu.mjs";
import { g as useAuth, h as isLoadingPhase } from "./auth-context-fSvbzOPB.mjs";
import { Yt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as PageSkeletonBoundary } from "./page-skeleton-boundary-ZBP950Us.mjs";
import { t as PageMotionShell } from "./page-motion-shell-Ci2leIYf.mjs";
import { r as useUrlSearchParamsContext } from "./use-url-search-params-CvniTNfQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pending-approval-BuxltLtB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function getStatusCopy(status) {
	switch (status) {
		case "pending": return {
			title: "Awaiting approval",
			message: "Your account request is pending review. Check back here after your workspace admin approves access."
		};
		case "invited": return {
			title: "Finish your setup",
			message: "Your invitation is not fully activated yet. Complete the invite flow from your email or ask your admin to resend it."
		};
		case "disabled": return {
			title: "Account disabled",
			message: "This workspace account has been disabled. Contact your workspace administrator if you believe this is a mistake."
		};
		case "suspended": return {
			title: "Account suspended",
			message: "Your access is currently suspended. Contact your workspace administrator for details about reactivation."
		};
		default: return {
			title: "Account unavailable",
			message: "We could not verify your account access right now. Refresh your status or sign in again."
		};
	}
}
function PendingApprovalContent() {
	const { user, authPhase, authError, retrySync, signOut } = useAuth();
	const { replace } = useRouter$1();
	const requestedStatus = useUrlSearchParamsContext().get("status") ?? "";
	(0, import_react.useEffect)(() => {
		if (isLoadingPhase(authPhase)) return;
		if (authPhase === "unauthenticated") {
			replace("/auth");
			return;
		}
		if (authPhase === "ready_active") replace("/for-you");
	}, [authPhase, replace]);
	const statusCopy = getStatusCopy(user?.status ?? requestedStatus);
	const handleRefreshStatus = () => {
		retrySync();
	};
	const handleSignOut = () => {
		signOut().finally(() => {
			replace("/auth");
		});
	};
	const authLoading = isLoadingPhase(authPhase);
	if (authPhase === "sync_failed") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-lg rounded-2xl border border-border bg-background p-8 shadow-sm text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold text-foreground",
					children: "Could not verify your account"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm leading-6 text-muted-foreground",
					children: authError?.message ?? "We could not finish loading your workspace profile. Try again or sign in once more."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 grid gap-3 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: handleRefreshStatus,
						children: "Retry"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: handleSignOut,
						children: "Sign out"
					})]
				})
			]
		})
	});
	if (authPhase === "unauthenticated") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeletonBoundary, {
		loading: authLoading,
		loadingContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 rounded-lg border border-border bg-background px-5 py-4 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted-foreground",
					children: "Checking your account status…"
				})]
			})
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMotionShell, {
			reveal: false,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-lg rounded-2xl border border-border bg-background p-8 shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground",
								children: "Account status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-2xl font-semibold text-foreground",
								children: statusCopy.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-6 text-muted-foreground",
								children: statusCopy.message
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleRefreshStatus,
							children: "Check status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: handleSignOut,
							children: "Sign out"
						})]
					})]
				})
			})
		})
	});
}
function PendingApprovalFallback() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 rounded-lg border border-border bg-background px-5 py-4 shadow-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm text-muted-foreground",
				children: "Checking your account status…"
			})]
		})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
	fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PendingApprovalFallback, {}),
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PendingApprovalContent, {})
});
//#endregion
export { SplitComponent as component };
