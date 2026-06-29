import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { i as notifyFailure, n as dismissToast, o as notifySuccess, s as notifyWarning } from "./notifications-DQZKskhM.mjs";
import { n as usePathname, r as useRouter$1 } from "./navigation-C1M-rNAu.mjs";
import { g as useAuth, h as isLoadingPhase } from "./auth-context-fSvbzOPB.mjs";
import { t as ClientProvider } from "./client-context-BNynWehF.mjs";
import { Yt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as dynamic } from "./dynamic-D6gKSsRx.mjs";
import { t as PreviewProvider } from "./preview-context-DiCPwKfi.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { t as UrlSearchParamsFallback } from "./use-url-search-params-CvniTNfQ.mjs";
import { t as SiteLogo } from "./site-logo-B5LJooib.mjs";
import { t as PreferencesProvider } from "./preferences-context-D6bi2pUb.mjs";
import { t as ProjectProvider } from "./project-context-HGgHVwvo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/workspace-providers-BRcwzunN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SESSION_WARNING_WINDOW_MS = 7200 * 1e3 / 10;
var SESSION_WARNING_TOAST_ID = "session-expiry-warning";
var SESSION_EXPIRED_TOAST_ID = "session-expired";
async function fetchSessionMetadata() {
	try {
		const response = await fetch("/api/auth/session", {
			method: "GET",
			credentials: "include",
			headers: {
				Accept: "application/json",
				"Cache-Control": "no-store"
			}
		});
		if (!response.ok) return null;
		const payload = await response.json();
		return {
			hasSession: payload.hasSession === true,
			expiresAt: typeof payload.expiresAt === "number" && Number.isFinite(payload.expiresAt) ? payload.expiresAt : null,
			csrfToken: typeof payload.csrfToken === "string" && payload.csrfToken.length > 0 ? payload.csrfToken : null
		};
	} catch {
		return null;
	}
}
async function refreshSession() {
	const metadata = await fetchSessionMetadata();
	if (!metadata?.csrfToken) return null;
	if (!(await fetch("/api/auth/session", {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			"x-csrf-token": metadata.csrfToken
		},
		body: "{}"
	})).ok) return null;
	return await fetchSessionMetadata();
}
function hasRequiredRole(userRole, requiredRole) {
	const roleHierarchy = {
		client: 0,
		team: 1,
		admin: 2
	};
	return (userRole ? roleHierarchy[userRole] ?? 0 : 0) >= (requiredRole ? roleHierarchy[requiredRole] ?? 0 : 0);
}
function AccessOverlay({ title, message, actionHref, actionLabel, actionOnClick, secondaryActionLabel, secondaryActionOnClick, actionVariant = "default", showSpinner, showLogo }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-muted/40 px-4 py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-lg border border-border bg-background p-8 text-center shadow-sm",
			children: [
				showLogo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-8 flex justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLogo, { size: "wordmarkXl" })
				}) : null,
				showSpinner ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-4 flex justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-primary" })
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-2 text-lg font-semibold text-foreground",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: message
				}),
				actionLabel || secondaryActionLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center",
					children: [actionLabel ? actionHref ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: actionVariant,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
							href: actionHref,
							children: actionLabel
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: actionVariant,
						onClick: actionOnClick,
						children: actionLabel
					}) : null, secondaryActionLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: secondaryActionOnClick,
						children: secondaryActionLabel
					}) : null]
				}) : null
			]
		})
	});
}
function ProtectedRoute({ children, requiredRole, allowPreviewAccess = false }) {
	const { user, authPhase, authError, retrySync, signOut } = useAuth();
	const { replace } = useRouter$1();
	const pathname = usePathname();
	const hasPreviewAccess = allowPreviewAccess;
	const warningTimerRef = (0, import_react.useRef)(null);
	const expiryTimerRef = (0, import_react.useRef)(null);
	const clearSessionTimers = (0, import_react.useEffectEvent)(() => {
		if (warningTimerRef.current) {
			clearTimeout(warningTimerRef.current);
			warningTimerRef.current = null;
		}
		if (expiryTimerRef.current) {
			clearTimeout(expiryTimerRef.current);
			expiryTimerRef.current = null;
		}
	});
	const redirectToAuth = () => {
		replace(`/auth${pathname ? `?redirect=${encodeURIComponent(pathname)}` : ""}`);
	};
	const handleRetrySync = () => {
		retrySync();
	};
	const handleSignOutAfterSyncFailure = () => {
		signOut().finally(() => {
			redirectToAuth();
		});
	};
	(0, import_react.useEffect)(() => {
		return () => {
			clearSessionTimers();
			dismissToast(SESSION_WARNING_TOAST_ID);
			dismissToast(SESSION_EXPIRED_TOAST_ID);
		};
	}, []);
	const handleSessionExpired = (0, import_react.useEffectEvent)(() => {
		clearSessionTimers();
		dismissToast(SESSION_WARNING_TOAST_ID);
		notifyFailure({
			id: SESSION_EXPIRED_TOAST_ID,
			title: "Session expired",
			message: "Please sign in again to continue where you left off.",
			duration: 6e3
		});
		signOut().finally(() => {
			redirectToAuth();
		});
	});
	const scheduleSessionPromptsRef = (0, import_react.useRef)(() => {});
	const scheduleSessionPrompts = (0, import_react.useEffectEvent)((metadata) => {
		clearSessionTimers();
		if (!metadata?.hasSession || !metadata.expiresAt) return;
		const remainingMs = metadata.expiresAt - Date.now();
		if (remainingMs <= 0) {
			handleSessionExpired();
			return;
		}
		const showWarning = () => {
			notifyWarning({
				id: SESSION_WARNING_TOAST_ID,
				title: "Session ending soon",
				message: "Stay signed in to keep working without interruption.",
				duration: 0,
				action: {
					label: "Stay signed in",
					onClick: () => {
						refreshSession().then((nextMetadata) => {
							if (!nextMetadata?.hasSession || !nextMetadata.expiresAt) throw new Error("Session refresh failed");
							notifySuccess({
								id: SESSION_WARNING_TOAST_ID,
								title: "Session extended",
								message: "Your workspace session is active again.",
								duration: 4e3
							});
							scheduleSessionPromptsRef.current(nextMetadata);
						}).catch(() => {
							notifyFailure({
								id: SESSION_WARNING_TOAST_ID,
								title: "Could not extend session",
								message: "Please save your work and sign in again before the session expires.",
								duration: 6e3
							});
						});
					}
				}
			});
		};
		if (remainingMs <= SESSION_WARNING_WINDOW_MS) showWarning();
		else warningTimerRef.current = setTimeout(showWarning, remainingMs - SESSION_WARNING_WINDOW_MS);
		expiryTimerRef.current = setTimeout(() => {
			handleSessionExpired();
		}, remainingMs);
	});
	(0, import_react.useEffect)(() => {
		scheduleSessionPromptsRef.current = scheduleSessionPrompts;
	});
	(0, import_react.useEffect)(() => {
		if (hasPreviewAccess || authPhase !== "ready_active" || !user) {
			clearSessionTimers();
			dismissToast(SESSION_WARNING_TOAST_ID);
			return;
		}
		let cancelled = false;
		const syncSessionExpiry = async () => {
			if (cancelled || hasPreviewAccess || authPhase !== "ready_active" || !user) return;
			const metadata = await fetchSessionMetadata();
			if (cancelled) return;
			scheduleSessionPrompts(metadata);
		};
		syncSessionExpiry();
		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") syncSessionExpiry();
		};
		const handleFocus = () => {
			syncSessionExpiry();
		};
		window.addEventListener("focus", handleFocus);
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			cancelled = true;
			clearSessionTimers();
			window.removeEventListener("focus", handleFocus);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [
		authPhase,
		hasPreviewAccess,
		user
	]);
	const redirectedPendingRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (hasPreviewAccess || authPhase !== "ready_pending" || pathname === "/pending-approval" || redirectedPendingRef.current) return;
		redirectedPendingRef.current = true;
		const status = user?.status ?? "pending";
		window.location.href = `/pending-approval?status=${encodeURIComponent(status)}`;
	}, [
		authPhase,
		hasPreviewAccess,
		pathname,
		user?.status
	]);
	const redirectedUnauthRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (hasPreviewAccess || authPhase !== "unauthenticated" || pathname === "/auth" || redirectedUnauthRef.current) return;
		redirectedUnauthRef.current = true;
		redirectToAuth();
	}, [
		authPhase,
		hasPreviewAccess,
		pathname
	]);
	if (hasPreviewAccess) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
	if (isLoadingPhase(authPhase)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessOverlay, {
		title: "Loading your workspace",
		message: "Just a moment while we secure your account and verify your permissions.",
		showLogo: true,
		showSpinner: true
	});
	if (authPhase === "sync_failed") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessOverlay, {
		title: "Could not connect your workspace",
		message: authError?.message ?? "We could not finish securing your session. Try again or sign in once more.",
		actionLabel: "Retry",
		actionOnClick: handleRetrySync,
		secondaryActionLabel: "Sign out",
		secondaryActionOnClick: handleSignOutAfterSyncFailure
	});
	if (authPhase === "unauthenticated") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessOverlay, {
		title: "Signing you in",
		message: "Redirecting to the sign-in page...",
		showLogo: true,
		showSpinner: true
	});
	if (authPhase === "ready_pending") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessOverlay, {
		title: "Checking account access",
		message: "Taking you to your account status page so you can review the next steps.",
		showLogo: true,
		showSpinner: true
	});
	if (authPhase !== "ready_active" || !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessOverlay, {
		title: "Loading your workspace",
		message: "Just a moment while we secure your account and verify your permissions.",
		showLogo: true,
		showSpinner: true
	});
	if (requiredRole && !hasRequiredRole(user.role, requiredRole)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessOverlay, {
		title: "Insufficient permissions",
		message: "You do not have the required role to access this area.",
		actionLabel: "Back to dashboard",
		actionHref: "/for-you"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
/**
* Code-splits Agent Mode (panel + FAB) so dashboard/settings shells pay less initial JS.
* Client-only — FAB/panel need browser APIs anyway.
*/
var AgentModeDynamic = dynamic(() => import("./agent-mode-MITJ4dJ8.mjs").then((m) => m.AgentMode), {
	ssr: false,
	loading: () => null
});
function WorkspaceProviders({ children, enablePreview = false, enableProject = false, enablePreferences = false }) {
	let content = children;
	const shouldEnablePreview = enablePreview || enablePreferences;
	if (enableProject) content = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UrlSearchParamsFallback, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectProvider, { children: content })
	});
	if (shouldEnablePreview) content = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewProvider, { children: content });
	if (enablePreferences) content = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreferencesProvider, { children: content });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientProvider, { children: content });
}
//#endregion
export { ProtectedRoute as n, WorkspaceProviders as r, AgentModeDynamic as t };
