import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { An as FileText, Ir as Bell, Mr as BriefcaseBusiness, P as SquareCheckBig, Rt as MessageSquare, Sr as ChartColumn, Ut as Megaphone, W as Share2, l as Video, mn as House } from "../_libs/lucide-react.mjs";
//#region src/services/auth/utils.ts
function normalizeRole(value) {
	switch (value) {
		case "admin":
		case "team":
		case "client": return value;
		case "manager": return "team";
		case "member": return "client";
		default: return "client";
	}
}
//#endregion
//#region src/lib/dashboard-navigation.ts
var DASHBOARD_NAVIGATION_GROUPS = [{
	id: "core",
	label: "Workspace",
	items: [
		{
			name: "For You",
			href: "/for-you",
			icon: House,
			description: "Your day and priorities"
		},
		{
			name: "Projects",
			href: "/dashboard/projects",
			icon: BriefcaseBusiness,
			description: "Client delivery and milestones"
		},
		{
			name: "Tasks",
			href: "/dashboard/tasks",
			icon: SquareCheckBig,
			description: "Assignments and work tracking"
		},
		{
			name: "Collaboration",
			href: "/dashboard/collaboration",
			icon: MessageSquare,
			description: "Chat and shared context"
		},
		{
			name: "Meetings",
			href: "/dashboard/meetings",
			icon: Video,
			description: "Schedule and run meetings"
		},
		{
			name: "Notifications",
			href: "/dashboard/notifications",
			icon: Bell,
			description: "Mentions and system alerts"
		}
	]
}, {
	id: "agency-tools",
	label: "Agency tools",
	items: [
		{
			name: "Analytics",
			href: "/dashboard/analytics",
			icon: ChartColumn,
			description: "Traffic, funnels, and client performance",
			capability: "analytics.view"
		},
		{
			name: "Ads",
			href: "/dashboard/ads",
			icon: Megaphone,
			description: "Ad integrations and pacing",
			capability: "agency.ads",
			roles: ["admin", "team"]
		},
		{
			name: "Socials",
			href: "/dashboard/socials",
			icon: Share2,
			description: "Social and content sync",
			capability: "agency.socials",
			roles: ["admin", "team"]
		},
		{
			name: "Proposals",
			href: "/dashboard/proposals",
			icon: FileText,
			description: "Shared proposals and decks from your agency",
			capability: "proposals.view"
		}
	]
}];
//#endregion
//#region src/lib/access-control/dashboard-access.ts
var ALL_ROLES = [
	"admin",
	"team",
	"client"
];
var AGENCY_ROLES = ["admin", "team"];
var CAPABILITY_ROLES = {
	"analytics.view": ALL_ROLES,
	"proposals.view": ALL_ROLES,
	"proposals.manage": AGENCY_ROLES,
	"agency.ads": AGENCY_ROLES,
	"agency.socials": AGENCY_ROLES,
	"admin.directory": ["admin"]
};
/** Longest-prefix-first route guards (pathname must match or start with prefix + /). */
var ROUTE_ACCESS = [
	{
		prefix: "/admin/clients",
		capability: "admin.directory"
	},
	{
		prefix: "/dashboard/ads",
		capability: "agency.ads"
	},
	{
		prefix: "/dashboard/socials",
		capability: "agency.socials"
	},
	{
		prefix: "/dashboard/proposals",
		capability: "proposals.view"
	},
	{
		prefix: "/dashboard/analytics",
		capability: "analytics.view"
	}
];
var HREF_CAPABILITY = {
	"/dashboard/analytics": "analytics.view",
	"/dashboard/ads": "agency.ads",
	"/dashboard/socials": "agency.socials",
	"/dashboard/proposals": "proposals.view",
	"/admin/clients": "admin.directory"
};
function normalizeAuthRole(role) {
	return normalizeRole(role);
}
function can(role, capability) {
	const normalized = normalizeAuthRole(role);
	return CAPABILITY_ROLES[capability].includes(normalized);
}
function capabilityForHref(href) {
	return HREF_CAPABILITY[href] ?? null;
}
/** Prefixes that require agency-only capabilities (Ads + Socials). */
function agencyOnlyPrefixes() {
	return ROUTE_ACCESS.flatMap((entry) => entry.capability === "agency.ads" || entry.capability === "agency.socials" ? [entry.prefix] : []);
}
function matchesRoutePrefix(pathname, prefix) {
	return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
function canAccessPath(role, pathname) {
	for (const entry of ROUTE_ACCESS) if (matchesRoutePrefix(pathname, entry.prefix)) return can(role, entry.capability);
	return true;
}
function navItemsForRole(role, groups = DASHBOARD_NAVIGATION_GROUPS) {
	const normalized = normalizeAuthRole(role);
	return groups.flatMap((group) => {
		const items = group.items.filter((item) => {
			const capability = item.capability ?? capabilityForHref(item.href);
			if (!capability) return true;
			return CAPABILITY_ROLES[capability].includes(normalized);
		});
		return items.length > 0 ? [{
			...group,
			items
		}] : [];
	});
}
function accessDeniedContentForCapability(capability, role) {
	if (capability === "admin.directory") return {
		title: "Administrator access required",
		message: "Client directory and workspace administration are limited to administrators.",
		actionLabel: "Back to For You",
		actionHref: "/for-you"
	};
	if (capability === "agency.ads" || capability === "agency.socials") return {
		title: "Agency tools only",
		message: role === "client" ? "Paid media and social sync tools are managed by your agency team. You can still view Analytics and shared Proposals for your workspace." : "This area is for agency team members with the right permissions.",
		actionLabel: "Back to For You",
		actionHref: "/for-you"
	};
	return {
		title: "Access restricted",
		message: "You don't have permission to view this page with your current role.",
		actionLabel: "Back to For You",
		actionHref: "/for-you"
	};
}
function accessDeniedContentForPath(pathname, role) {
	const normalized = normalizeAuthRole(role);
	for (const entry of ROUTE_ACCESS) if (matchesRoutePrefix(pathname, entry.prefix) && !can(normalized, entry.capability)) return accessDeniedContentForCapability(entry.capability, normalized);
	return null;
}
//#endregion
//#region src/shared/hooks/use-keyboard-shortcuts.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var SEQUENCE_TIMEOUT_MS = 1200;
function parseCombo(combo) {
	const parts = combo.toLowerCase().split("+").map((p) => p.trim());
	const key = parts.pop() || "";
	const modifiers = new Set(parts);
	const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
	if (modifiers.has("mod")) {
		modifiers.delete("mod");
		modifiers.add(isMac ? "meta" : "ctrl");
	}
	if (modifiers.has("cmd") || modifiers.has("meta")) {
		modifiers.delete("cmd");
		modifiers.delete("meta");
		modifiers.add("meta");
	}
	return {
		modifiers,
		key
	};
}
function matchesCombo(event, combo) {
	const { modifiers, key } = parseCombo(combo);
	const eventKey = event.key.toLowerCase();
	const eventModifiers = /* @__PURE__ */ new Set();
	if (event.ctrlKey) eventModifiers.add("ctrl");
	if (event.metaKey) eventModifiers.add("meta");
	if (event.shiftKey) eventModifiers.add("shift");
	if (event.altKey) eventModifiers.add("alt");
	const keyMatches = eventKey === key || event.code.toLowerCase() === key || event.code.toLowerCase() === `key${key}`;
	const modifiersMatch = modifiers.size === eventModifiers.size && [...modifiers].every((m) => eventModifiers.has(m));
	return keyMatches && modifiersMatch;
}
function getSequenceSteps(combo) {
	return combo.trim().split(/\s+/).filter(Boolean);
}
function matchesShortcutCombo(event, combo, sequenceStates, stateKey) {
	const steps = getSequenceSteps(combo);
	const firstStep = steps[0];
	if (!firstStep) {
		sequenceStates.delete(stateKey);
		return "none";
	}
	const state = sequenceStates.get(stateKey);
	const now = Date.now();
	const resetProgress = !state || now - state.lastMatchedAt > SEQUENCE_TIMEOUT_MS ? 0 : state.progress;
	if (matchesCombo(event, steps[resetProgress] ?? firstStep)) {
		if (steps.length === 1 || resetProgress === steps.length - 1) {
			sequenceStates.delete(stateKey);
			return "complete";
		}
		sequenceStates.set(stateKey, {
			progress: resetProgress + 1,
			lastMatchedAt: now
		});
		return "partial";
	}
	if (resetProgress > 0 && matchesCombo(event, firstStep)) {
		if (steps.length === 1) {
			sequenceStates.delete(stateKey);
			return "complete";
		}
		sequenceStates.set(stateKey, {
			progress: 1,
			lastMatchedAt: now
		});
		return "partial";
	}
	if (resetProgress > 0) sequenceStates.delete(stateKey);
	return "none";
}
function useKeyboardShortcut(shortcut, options = {}) {
	const { enabled = true, targetRef, allowInInput = false } = options;
	const callbackRef = (0, import_react.useRef)(shortcut.callback);
	const sequenceStatesRef = (0, import_react.useRef)(null);
	if (sequenceStatesRef.current === null) sequenceStatesRef.current = /* @__PURE__ */ new Map();
	(0, import_react.useEffect)(() => {
		callbackRef.current = shortcut.callback;
	}, [shortcut.callback]);
	const handleKeyDown = (0, import_react.useEffectEvent)((event) => {
		if (!enabled || shortcut.enabled === false) return;
		const target = event.target;
		const isInput = [
			"INPUT",
			"TEXTAREA",
			"SELECT"
		].includes(target.tagName) || target.isContentEditable;
		const combos = Array.isArray(shortcut.combo) ? shortcut.combo : [shortcut.combo];
		const isEscape = combos.some((c) => c.toLowerCase() === "escape");
		if (isInput && !isEscape && !allowInInput) return;
		for (const [comboIndex, combo] of combos.entries()) {
			const matchState = matchesShortcutCombo(event, combo, sequenceStatesRef.current, `${comboIndex}:${combo}`);
			if (matchState === "partial") {
				if (shortcut.preventDefault !== false) event.preventDefault();
				return;
			}
			if (matchState === "complete") {
				if (shortcut.preventDefault !== false) event.preventDefault();
				callbackRef.current(event);
				return;
			}
		}
	});
	(0, import_react.useEffect)(() => {
		const target = targetRef?.current || document;
		const listener = (event) => handleKeyDown(event);
		target.addEventListener("keydown", listener);
		return () => {
			target.removeEventListener("keydown", listener);
		};
	}, [
		allowInInput,
		enabled,
		shortcut.combo,
		shortcut.enabled,
		targetRef
	]);
}
function useKeyboardShortcuts(shortcuts, options = {}) {
	const { enabled = true, targetRef, allowInInput = false } = options;
	const sequenceStatesRef = (0, import_react.useRef)(null);
	if (sequenceStatesRef.current === null) sequenceStatesRef.current = /* @__PURE__ */ new Map();
	const shortcutsRef = (0, import_react.useRef)(shortcuts);
	(0, import_react.useEffect)(() => {
		shortcutsRef.current = shortcuts;
	}, [shortcuts]);
	const handleKeyDown = (0, import_react.useEffectEvent)((event) => {
		if (!enabled) return;
		const target = event.target;
		const isInput = [
			"INPUT",
			"TEXTAREA",
			"SELECT"
		].includes(target.tagName) || target.isContentEditable;
		for (const shortcut of shortcutsRef.current) {
			if (shortcut.enabled === false) continue;
			const combos = Array.isArray(shortcut.combo) ? shortcut.combo : [shortcut.combo];
			const isEscape = combos.some((c) => c.toLowerCase() === "escape");
			if (isInput && !isEscape && !allowInInput) continue;
			for (const [comboIndex, combo] of combos.entries()) {
				const matchState = matchesShortcutCombo(event, combo, sequenceStatesRef.current, `${shortcut.description ?? shortcut.callback.name ?? "shortcut"}:${comboIndex}:${combo}`);
				if (matchState === "partial") {
					if (shortcut.preventDefault !== false) event.preventDefault();
					return;
				}
				if (matchState === "complete") {
					if (shortcut.preventDefault !== false) event.preventDefault();
					shortcut.callback(event);
					return;
				}
			}
		}
	});
	(0, import_react.useEffect)(() => {
		const target = targetRef?.current || document;
		const listener = (event) => handleKeyDown(event);
		target.addEventListener("keydown", listener);
		return () => {
			target.removeEventListener("keydown", listener);
		};
	}, [
		allowInInput,
		enabled,
		targetRef
	]);
}
function KeyboardShortcutBadge({ combo, className }) {
	const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
	const parts = combo.split("+");
	const tokenCounts = /* @__PURE__ */ new Map();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
		className: `inline-flex items-center gap-0.5 ${className || ""}`,
		children: parts.map((part) => {
			const p = part.toLowerCase().trim();
			const occurrence = (tokenCounts.get(p) ?? 0) + 1;
			tokenCounts.set(p, occurrence);
			let display = p.toUpperCase();
			if (p === "mod") display = isMac ? "⌘" : "Ctrl";
			else if (p === "cmd" || p === "meta") display = isMac ? "⌘" : "Ctrl";
			else if (p === "ctrl") display = isMac ? "⌃" : "Ctrl";
			else if (p === "alt") display = isMac ? "⌥" : "Alt";
			else if (p === "shift") display = isMac ? "⇧" : "Shift";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "inline-flex h-5 min-w-5 items-center justify-center rounded border border-muted-foreground/30 bg-muted px-1 text-[10px] font-medium text-muted-foreground",
				children: display
			}, `${p}-${occurrence}`);
		})
	});
}
//#endregion
export { accessDeniedContentForPath as a, canAccessPath as c, normalizeAuthRole as d, accessDeniedContentForCapability as i, capabilityForHref as l, useKeyboardShortcut as n, agencyOnlyPrefixes as o, useKeyboardShortcuts as r, can as s, KeyboardShortcutBadge as t, navItemsForRole as u };
